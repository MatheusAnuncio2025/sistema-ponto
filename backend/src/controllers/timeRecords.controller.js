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

const toMinutesFromDate = (dateValue) => {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
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

const resolveScheduleForDay = (schedule, day, employee) => {
  if (!schedule) return null;
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
  const resolved = {
    ...baseRule,
    ...(dayRule || {}),
  };
  if (employee && employee.lunch_start) {
    resolved.lunch_start = employee.lunch_start;
  }
  if (employee && employee.lunch_end) {
    resolved.lunch_end = employee.lunch_end;
  }
  return resolved;
};

const calculateExpectedMinutes = (schedule, day, employee) => {
  const resolved = resolveScheduleForDay(schedule, day, employee);
  if (!resolved || !resolved.start_time || !resolved.end_time) return null;
  const start = timeToMinutes(resolved.start_time);
  const end = timeToMinutes(resolved.end_time);
  if (start === null || end === null) return null;
  const lunchStart = resolved.lunch_start ? timeToMinutes(resolved.lunch_start) : null;
  const lunchEnd = resolved.lunch_end ? timeToMinutes(resolved.lunch_end) : null;
  const lunch = lunchStart !== null && lunchEnd !== null ? lunchEnd - lunchStart : 0;
  return Math.max(end - start - lunch, 0);
};

const calculateWorkedMinutes = (records) => {
  const entry = records.find((r) => r.record_type === 'entry');
  const exit = records.find((r) => r.record_type === 'exit');
  if (!entry || !exit) return null;
  const start = toMinutesFromDate(entry.timestamp);
  const end = toMinutesFromDate(exit.timestamp);
  if (start === null || end === null) return null;
  const lunchStart = records.find((r) => r.record_type === 'lunch_start');
  const lunchEnd = records.find((r) => r.record_type === 'lunch_end');
  const interval =
    lunchStart && lunchEnd
      ? Math.max(toMinutesFromDate(lunchEnd.timestamp) - toMinutesFromDate(lunchStart.timestamp), 0)
      : 0;
  return Math.max(end - start - interval, 0);
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
    let locationWarning = null;

    if (!employee.is_hybrid && workLocation) {
      if (lat !== null && lon !== null) {
        distanceMeters = calculateDistanceMeters(
          lat,
          lon,
          Number(workLocation.latitude),
          Number(workLocation.longitude)
        );
        isWithinRadius = distanceMeters <= Number(workLocation.radius);
      } else {
        isWithinRadius = false;
        locationWarning = 'Localizacao nao informada';
      }
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

    if (record_type === 'exit') {
      const recordDay = new Date(record.timestamp);
      const startOfDay = new Date(recordDay);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(recordDay);
      endOfDay.setHours(23, 59, 59, 999);

      const dayRecords = await TimeRecord.findAll({
        where: {
          employee_id: employee.id,
          timestamp: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        order: [['timestamp', 'ASC']],
      });

      const exitCount = dayRecords.filter((r) => r.record_type === 'exit').length;
      if (exitCount === 1) {
        const workedMin = calculateWorkedMinutes(dayRecords);
        const expectedMin = calculateExpectedMinutes(
          employee.workSchedule,
          recordDay.getDay(),
          employee
        );
        if (workedMin !== null && expectedMin !== null) {
          const deltaHours = Number(((workedMin - expectedMin) / 60).toFixed(2));
          const currentBalance = Number(employee.hours_balance || 0);
          await employee.update({
            hours_balance: Number((currentBalance + deltaHours).toFixed(2)),
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      record,
      warning: [scheduleCheck.warning, locationWarning].filter(Boolean).join(' | ') || undefined,
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
