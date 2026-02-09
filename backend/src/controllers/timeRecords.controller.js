const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Employee, TimeRecord, WorkLocation, WorkSchedule, SystemSetting } = require('../models');
const { calculateDistanceMeters } = require('../utils/geo');
const { generateConfirmationCode } = require('../utils/confirmation');

const allowedRecordTypes = new Set(['entry', 'lunch_start', 'lunch_end', 'exit']);
const defaultPunchPolicy = {
  allow_admin_out_of_schedule: true,
  allow_hr_out_of_schedule: true,
  allow_supervisor_out_of_schedule: true,
  allow_coordinator_out_of_schedule: true,
  allow_manager_out_of_schedule: false,
};

const getPunchPolicy = async () => {
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = await SystemSetting.create(defaultPunchPolicy);
  }
  return settings;
};

const parseRange = (range, dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  let start;
  let end;

  if (range === 'month') {
    start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (range === 'week') {
    const day = date.getDay(); // 0 (Dom) - 6 (Sáb)
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);
  } else {
    start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  return { start, end };
};

const findEmployeeWithLocation = async (userId) => {
  return Employee.findOne({
    where: { user_id: userId },
    include: [
      {
        model: WorkLocation,
        as: 'workLocation',
      },
      {
        model: WorkSchedule,
        as: 'workSchedule',
      },
    ],
  });
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':').map(Number);
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return null;
  }
  return parts[0] * 60 + parts[1];
};

const buildScheduleValidation = (schedule, recordType, now, employee) => {
  if (!schedule) {
    return { valid: true, warning: 'Funcionário sem escala definida' };
  }

  const day = now.getDay(); // 0 (Dom) - 6 (Sáb)
  const workDays = Array.isArray(schedule.work_days) ? schedule.work_days : [];
  if (!workDays.includes(day)) {
    return {
      valid: false,
      message: 'Dia fora da escala de trabalho',
    };
  }

  const tolerance = Number(schedule.tolerance_minutes) || 0;
  const dayKey = String(day);
  const dayRule =
    schedule.day_rules && typeof schedule.day_rules === 'object'
      ? schedule.day_rules[dayKey]
      : null;

  const baseRule = {
    start_time: schedule.start_time,
    lunch_start: schedule.lunch_start,
    lunch_end: schedule.lunch_end,
    end_time: schedule.end_time,
  };

  const resolvedRule = {
    ...baseRule,
    ...(dayRule || {}),
  };

  if (employee && employee.lunch_start) {
    resolvedRule.lunch_start = employee.lunch_start;
  }
  if (employee && employee.lunch_end) {
    resolvedRule.lunch_end = employee.lunch_end;
  }

  const timeMap = {
    entry: resolvedRule.start_time,
    lunch_start: resolvedRule.lunch_start,
    lunch_end: resolvedRule.lunch_end,
    exit: resolvedRule.end_time,
  };

  const recordLabels = {
    entry: 'Entrada',
    lunch_start: 'Início do almoço',
    lunch_end: 'Fim do almoço',
    exit: 'Saída',
  };

  const targetTime = timeMap[recordType];
  const targetMinutes = timeToMinutes(targetTime);
  if (targetMinutes === null) {
    return {
      valid: true,
      warning: 'Horário não configurado na escala',
    };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minAllowed = targetMinutes - tolerance;
  const maxAllowed = targetMinutes + tolerance;

  if (nowMinutes < minAllowed || nowMinutes > maxAllowed) {
    return {
      valid: false,
      message: `Fora da janela permitida (${tolerance} min) para ${recordLabels[recordType] || 'registro'}`,
      window: {
        min: minAllowed,
        max: maxAllowed,
      },
    };
  }

  return { valid: true };
};

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { record_type, latitude, longitude } = req.body;
    if (!allowedRecordTypes.has(record_type)) {
      return res.status(400).json({ success: false, message: 'Tipo de registro inválido' });
    }

    const employee = await findEmployeeWithLocation(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
    }

    const policy = await getPunchPolicy();
    const allowRoleOutOfSchedule = {
      admin: policy.allow_admin_out_of_schedule,
      hr: policy.allow_hr_out_of_schedule,
      supervisor: policy.allow_supervisor_out_of_schedule,
      coordinator: policy.allow_coordinator_out_of_schedule,
      manager: policy.allow_manager_out_of_schedule,
    };
    const isPrivileged = Boolean(allowRoleOutOfSchedule[req.user.role]);
    const scheduleCheck = buildScheduleValidation(
      employee.workSchedule,
      record_type,
      new Date(),
      employee
    );
    let overrideInfo = null;
    if (!scheduleCheck.valid && !isPrivileged) {
      const now = new Date();
      const overrideUntil = employee.punch_override_until
        ? new Date(employee.punch_override_until)
        : null;
      if (overrideUntil && !Number.isNaN(overrideUntil.getTime()) && now <= overrideUntil) {
        overrideInfo = {
          by: employee.punch_override_by || null,
          reason: employee.punch_override_reason || null,
        };
      } else {
        return res.status(422).json({
          success: false,
          message: scheduleCheck.message || 'Horário inválido para a escala',
          schedule: scheduleCheck.window ? scheduleCheck.window : undefined,
        });
      }
    }

    if (!scheduleCheck.valid && isPrivileged) {
      overrideInfo = {
        by: req.user.id,
        reason: 'liberação por perfil privilegiado',
      };
    }

    if (!scheduleCheck.valid && !overrideInfo) {
      return res.status(422).json({
        success: false,
        message: scheduleCheck.message || 'Horário inválido para a escala',
        schedule: scheduleCheck.window ? scheduleCheck.window : undefined,
      });
    }

    const workLocation = employee.workLocation || null;
    const lat = latitude !== undefined && latitude !== null ? Number(latitude) : null;
    const lon = longitude !== undefined && longitude !== null ? Number(longitude) : null;

    let isWithinRadius = true;
    let distanceMeters = null;

    if (!employee.is_hybrid && workLocation && lat !== null && lon !== null) {
      distanceMeters = calculateDistanceMeters(
        lat,
        lon,
        Number(workLocation.latitude),
        Number(workLocation.longitude)
      );
      isWithinRadius = distanceMeters <= Number(workLocation.radius);
    }

    let confirmationCode = generateConfirmationCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await TimeRecord.findOne({
        where: { confirmation_code: confirmationCode },
      });
      if (!existing) break;
      confirmationCode = generateConfirmationCode();
      attempts += 1;
    }

    const record = await TimeRecord.create({
      employee_id: employee.id,
      record_type,
      latitude: lat,
      longitude: lon,
      work_location_id: workLocation ? workLocation.id : null,
      is_within_radius: isWithinRadius,
      distance_meters: distanceMeters,
      is_schedule_override: Boolean(overrideInfo),
      schedule_override_by: overrideInfo ? overrideInfo.by : null,
      schedule_override_reason: overrideInfo ? overrideInfo.reason : null,
      confirmation_code: confirmationCode,
      device_info: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json({
      success: true,
      record,
      warning: scheduleCheck.warning,
      scheduleOverride: overrideInfo ? true : false,
      workLocation: workLocation
        ? {
            id: workLocation.id,
            name: workLocation.name,
            radius: workLocation.radius,
          }
        : null,
    });
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const { range = 'day', date } = req.query;
    const period = parseRange(range, date);
    if (!period) {
      return res.status(400).json({ success: false, message: 'Data inválida' });
    }

    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
    }

    const records = await TimeRecord.findAll({
      where: {
        employee_id: employee.id,
        timestamp: {
          [Op.between]: [period.start, period.end],
        },
      },
      order: [['timestamp', 'ASC']],
    });

    return res.json({
      success: true,
      range,
      start: period.start,
      end: period.end,
      records,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  create,
  list,
};
