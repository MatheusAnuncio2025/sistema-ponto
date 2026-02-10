const { Op } = require('sequelize');
const { Employee, User, WorkSchedule, TimeRecord, ReprocessLog } = require('../models');

const parseDayRange = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  return { start, end, date };
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
    const day = date.getDay();
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

  return { start, end, date };
};

const parseCustomRange = (startStr, endStr) => {
  if (!startStr || !endStr) return null;
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    0,
    0,
    0,
    0
  );
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    23,
    59,
    59,
    999
  );
  if (start > end) {
    return null;
  }
  return { start, end, date: endDate };
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':').map(Number);
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return null;
  }
  return parts[0] * 60 + parts[1];
};

const resolveStartTime = (schedule, day) => {
  if (!schedule) return null;
  const dayKey = String(day);
  const dayRule =
    schedule.day_rules && typeof schedule.day_rules === 'object'
      ? schedule.day_rules[dayKey]
      : null;
  return (dayRule && dayRule.start_time) || schedule.start_time || null;
};

const buildDateKey = (date) => date.toISOString().slice(0, 10);
const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};
const endOfDay = (d) => {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
};

const resolveScheduleForDay = (schedule, day, employee) => {
  if (!schedule) return null;
  const dayKey = String(day);
  const dayRule =
    schedule.day_rules && typeof schedule.day_rules === 'object'
      ? schedule.day_rules[dayKey]
      : null;
  const base = {
    start_time: schedule.start_time,
    lunch_start: schedule.lunch_start,
    lunch_end: schedule.lunch_end,
    end_time: schedule.end_time,
  };
  const resolved = { ...base, ...(dayRule || {}) };
  if (employee && employee.lunch_start) resolved.lunch_start = employee.lunch_start;
  if (employee && employee.lunch_end) resolved.lunch_end = employee.lunch_end;
  return resolved;
};

const calcExpectedMinutes = (schedule, day, employee) => {
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

const calcWorkedMinutes = (records) => {
  const entry = records.find((r) => r.record_type === 'entry');
  const exit = records.find((r) => r.record_type === 'exit');
  if (!entry || !exit) return null;
  const entryMin =
    new Date(entry.timestamp).getHours() * 60 + new Date(entry.timestamp).getMinutes();
  const exitMin =
    new Date(exit.timestamp).getHours() * 60 + new Date(exit.timestamp).getMinutes();
  const lunchStart = records.find((r) => r.record_type === 'lunch_start');
  const lunchEnd = records.find((r) => r.record_type === 'lunch_end');
  const interval =
    lunchStart && lunchEnd
      ? Math.max(
          new Date(lunchEnd.timestamp).getHours() * 60 +
            new Date(lunchEnd.timestamp).getMinutes() -
            (new Date(lunchStart.timestamp).getHours() * 60 +
              new Date(lunchStart.timestamp).getMinutes()),
          0
        )
      : 0;
  return Math.max(exitMin - entryMin - interval, 0);
};

const getDashboard = async (req, res, next) => {
  try {
    const dayPeriod = parseDayRange(req.query.date);
    if (!dayPeriod) {
      return res.status(400).json({ success: false, message: 'Data invalida' });
    }
    const customRange = parseCustomRange(req.query.start, req.query.end);
    const basePeriod = customRange || dayPeriod;

    const employees = await Employee.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role', 'is_active'] },
        { model: WorkSchedule, as: 'workSchedule' },
      ],
      order: [['created_at', 'ASC']],
    });

    const schedules = await WorkSchedule.findAll({
      attributes: ['id', 'name'],
      order: [['created_at', 'ASC']],
    });

    const activeEmployees = employees.filter((employee) => employee.user && employee.user.is_active);
    const departmentFilter = req.query.department ? String(req.query.department) : null;
    const scheduleFilter = req.query.schedule_id ? String(req.query.schedule_id) : null;

    const filteredEmployees = activeEmployees.filter((employee) => {
      if (departmentFilter && departmentFilter !== 'all') {
        if (!employee.department || employee.department !== departmentFilter) return false;
      }
      if (scheduleFilter && scheduleFilter !== 'all') {
        if (!employee.work_schedule_id || String(employee.work_schedule_id) !== scheduleFilter) {
          return false;
        }
      }
      return true;
    });

    const fetchRecords = async (period) =>
      TimeRecord.findAll({
        where: {
          timestamp: {
            [Op.between]: [period.start, period.end],
          },
        },
        order: [['timestamp', 'ASC']],
      });

    const computeStats = async (period, employeesList) => {
      const records = await fetchRecords(period);
      const recordsByEmployee = records.reduce((acc, record) => {
        acc[record.employee_id] = acc[record.employee_id] || [];
        acc[record.employee_id].push(record);
        return acc;
      }, {});

      const punchedSet = new Set();
      const lateSet = new Set();

      employeesList.forEach((employee) => {
        const list = recordsByEmployee[employee.id] || [];
        if (list.length > 0) {
          punchedSet.add(employee.id);
        }
        list.forEach((record) => {
          if (record.record_type !== 'entry') return;
          const recordDate = new Date(record.timestamp);
          const recordDay = recordDate.getDay();
          const schedule = employee.workSchedule || null;
          const startTime = resolveStartTime(schedule, recordDay);
          const tolerance = schedule ? Number(schedule.tolerance_minutes) || 0 : 0;
          const startMin = timeToMinutes(startTime);
          if (startMin !== null) {
            const entryMin = recordDate.getHours() * 60 + recordDate.getMinutes();
            if (entryMin > startMin + tolerance) {
              lateSet.add(employee.id);
            }
          }
        });
      });

      const totals = {
        employees: employeesList.length,
        punched: punchedSet.size,
        late: lateSet.size,
        absent: Math.max(employeesList.length - punchedSet.size, 0),
      };

      return { totals, recordsByEmployee };
    };

    const baseStats = await computeStats(basePeriod, filteredEmployees);

    const buildDayLists = () => {
      const punched = [];
      const late = [];
      const absent = [];
      const day = dayPeriod.date.getDay();

      filteredEmployees.forEach((employee) => {
        const schedule = employee.workSchedule || null;
        const workDays = schedule && Array.isArray(schedule.work_days) ? schedule.work_days : [];
        const worksToday = workDays.length === 0 ? false : workDays.includes(day);
        const list = baseStats.recordsByEmployee[employee.id] || [];
        const entry = list.find((r) => r.record_type === 'entry');
        const summary = {
          id: employee.id,
          name: employee.user.name,
          email: employee.user.email,
          role: employee.user.role,
          entry_time: entry ? entry.timestamp : null,
        };

        if (entry) {
          punched.push(summary);
          const startTime = resolveStartTime(schedule, day);
          const tolerance = schedule ? Number(schedule.tolerance_minutes) || 0 : 0;
          const startMin = timeToMinutes(startTime);
          if (startMin !== null) {
            const entryMin =
              new Date(entry.timestamp).getHours() * 60 + new Date(entry.timestamp).getMinutes();
            if (entryMin > startMin + tolerance) {
              late.push(summary);
            }
          }
        } else if (worksToday) {
          absent.push(summary);
        }
      });

      return { punched, late, absent };
    };

    const buildRangeLists = () => {
      const punched = [];
      const late = [];
      const absent = [];

      filteredEmployees.forEach((employee) => {
        const list = baseStats.recordsByEmployee[employee.id] || [];
        const entryRecords = list.filter((r) => r.record_type === 'entry');
        const firstEntry = entryRecords[0] || null;
        const summary = {
          id: employee.id,
          name: employee.user.name,
          email: employee.user.email,
          role: employee.user.role,
          entry_time: firstEntry ? firstEntry.timestamp : null,
        };

        if (entryRecords.length > 0) {
          punched.push(summary);
          const schedule = employee.workSchedule || null;
          entryRecords.forEach((entry) => {
            const recordDate = new Date(entry.timestamp);
            const recordDay = recordDate.getDay();
            const startTime = resolveStartTime(schedule, recordDay);
            const tolerance = schedule ? Number(schedule.tolerance_minutes) || 0 : 0;
            const startMin = timeToMinutes(startTime);
            if (startMin !== null) {
              const entryMin = recordDate.getHours() * 60 + recordDate.getMinutes();
              if (entryMin > startMin + tolerance) {
                late.push(summary);
              }
            }
          });
        } else {
          absent.push(summary);
        }
      });

      return { punched, late, absent };
    };

    const lists = customRange ? buildRangeLists() : buildDayLists();

    const weekPeriod = parseRange('week', dayPeriod.date);
    const monthPeriod = parseRange('month', dayPeriod.date);

    const weekStats = await computeStats(weekPeriod, filteredEmployees);
    const monthStats = await computeStats(monthPeriod, filteredEmployees);

    const series = [];
    const seriesStart = customRange ? customRange.start : dayPeriod.start;
    const seriesEnd = customRange ? customRange.end : dayPeriod.end;
    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.floor((seriesEnd - seriesStart) / msPerDay) + 1;
    const maxPoints = 14;
    const step = Math.max(Math.ceil(totalDays / maxPoints), 1);

    for (let i = 0; i < totalDays; i += step) {
      const date = new Date(seriesStart);
      date.setDate(seriesStart.getDate() + i);
      const range = parseDayRange(date);
      const stats = await computeStats(range, filteredEmployees);
      series.push({
        date: range.date,
        punched: stats.totals.punched,
        late: stats.totals.late,
        absent: stats.totals.absent,
      });
    }

    const computeRankings = () => {
      const entryByEmployeeDate = new Map();
      const lateByEmployee = new Map();
      const absentByEmployee = new Map();

      filteredEmployees.forEach((employee) => {
        entryByEmployeeDate.set(employee.id, new Set());
        lateByEmployee.set(employee.id, 0);
        absentByEmployee.set(employee.id, 0);
      });

      Object.entries(baseStats.recordsByEmployee).forEach(([employeeId, list]) => {
        list.forEach((record) => {
          if (record.record_type !== 'entry') return;
          const recordDate = new Date(record.timestamp);
          const dateKey = buildDateKey(recordDate);
          const dateSet = entryByEmployeeDate.get(employeeId);
          if (dateSet) {
            dateSet.add(dateKey);
          }
          const employee = filteredEmployees.find((emp) => emp.id === employeeId);
          if (!employee) return;
          const schedule = employee.workSchedule || null;
          const recordDay = recordDate.getDay();
          const startTime = resolveStartTime(schedule, recordDay);
          const tolerance = schedule ? Number(schedule.tolerance_minutes) || 0 : 0;
          const startMin = timeToMinutes(startTime);
          if (startMin !== null) {
            const entryMin = recordDate.getHours() * 60 + recordDate.getMinutes();
            if (entryMin > startMin + tolerance) {
              lateByEmployee.set(employeeId, (lateByEmployee.get(employeeId) || 0) + 1);
            }
          }
        });
      });

      const daysTotal = totalDays;
      filteredEmployees.forEach((employee) => {
        const schedule = employee.workSchedule || null;
        const workDays = schedule && Array.isArray(schedule.work_days) ? schedule.work_days : [];
        if (workDays.length === 0) return;
        for (let i = 0; i < daysTotal; i += 1) {
          const date = new Date(seriesStart);
          date.setDate(seriesStart.getDate() + i);
          const day = date.getDay();
          if (!workDays.includes(day)) continue;
          const dateKey = buildDateKey(date);
          const entryDates = entryByEmployeeDate.get(employee.id);
          if (!entryDates || !entryDates.has(dateKey)) {
            absentByEmployee.set(employee.id, (absentByEmployee.get(employee.id) || 0) + 1);
          }
        }
      });

      const toRanking = (map) =>
        filteredEmployees
          .map((employee) => ({
            id: employee.id,
            name: employee.user.name,
            email: employee.user.email,
            role: employee.user.role,
            count: map.get(employee.id) || 0,
          }))
          .filter((row) => row.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

      return {
        late: toRanking(lateByEmployee),
        absent: toRanking(absentByEmployee),
      };
    };

    const rankings = computeRankings();
    const departments = Array.from(
      new Set(filteredEmployees.map((employee) => employee.department).filter(Boolean))
    ).sort();

    return res.json({
      success: true,
      date: dayPeriod.date,
      range: customRange
        ? { start: customRange.start, end: customRange.end }
        : { start: dayPeriod.start, end: dayPeriod.end },
      totals: baseStats.totals,
      periods: {
        day: (await computeStats(dayPeriod, filteredEmployees)).totals,
        week: weekStats.totals,
        month: monthStats.totals,
      },
      lists: {
        punched: lists.punched,
        late: lists.late,
        absent: lists.absent,
      },
      series,
      rankings,
      filters: {
        departments,
        schedules: schedules.map((schedule) => ({ id: schedule.id, name: schedule.name })),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboard,
  reprocessHours: async (req, res, next) => {
    try {
      const customRange = parseCustomRange(req.body?.start, req.body?.end);
      let range = customRange;
      if (!range) {
        const earliestRecord = await TimeRecord.findOne({
          order: [['timestamp', 'ASC']],
          attributes: ['timestamp'],
        });
        const start = earliestRecord ? startOfDay(earliestRecord.timestamp) : startOfDay(new Date());
        const end = endOfDay(new Date());
        range = { start, end, date: end };
      }

      const employees = await Employee.findAll({
        include: [
          { model: WorkSchedule, as: 'workSchedule' },
        ],
      });

      const records = await TimeRecord.findAll({
        where: {
          timestamp: {
            [Op.between]: [range.start, range.end],
          },
        },
        order: [['timestamp', 'ASC']],
      });

      const recordsByEmployeeDay = {};
      records.forEach((record) => {
        const dayKey = buildDateKey(new Date(record.timestamp));
        const key = `${record.employee_id}:${dayKey}`;
        recordsByEmployeeDay[key] = recordsByEmployeeDay[key] || [];
        recordsByEmployeeDay[key].push(record);
      });

      let updated = 0;
      for (const employee of employees) {
        let balanceHours = 0;
        Object.keys(recordsByEmployeeDay).forEach((key) => {
          if (!key.startsWith(`${employee.id}:`)) return;
          const dayRecords = recordsByEmployeeDay[key];
          const sample = dayRecords[0];
          const day = new Date(sample.timestamp).getDay();
          const expected = calcExpectedMinutes(employee.workSchedule, day, employee);
          const worked = calcWorkedMinutes(dayRecords);
          if (expected !== null && worked !== null) {
            balanceHours += (worked - expected) / 60;
          }
        });

        await employee.update({
          hours_balance: Number(balanceHours.toFixed(2)),
        });
        updated += 1;
      }

      const log = await ReprocessLog.create({
        user_id: req.user.id,
        start_at: range.start,
        end_at: range.end,
        updated_count: updated,
      });

      return res.json({
        success: true,
        updated,
        range: { start: range.start, end: range.end },
        log,
      });
    } catch (error) {
      return next(error);
    }
  },
  listReprocessLogs: async (req, res, next) => {
    try {
      const range = parseCustomRange(req.query.start, req.query.end);
      const where = {};
      if (range) {
        where.created_at = {
          [Op.between]: [range.start, range.end],
        };
      }

      const logs = await ReprocessLog.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        where,
        order: [['created_at', 'DESC']],
        limit: 50,
      });
      return res.json({ success: true, logs });
    } catch (error) {
      return next(error);
    }
  },
};
