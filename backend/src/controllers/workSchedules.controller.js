const { validationResult } = require('express-validator');
const { WorkSchedule } = require('../models');

const list = async (req, res, next) => {
  try {
    const schedules = await WorkSchedule.findAll({
      order: [['created_at', 'DESC']],
    });
    return res.json({ success: true, schedules });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      type,
      work_days,
      start_time,
      lunch_start,
      lunch_end,
      end_time,
      day_rules,
      tolerance_minutes,
      weekly_hours,
      has_alternating_saturdays,
    } = req.body;

    const schedule = await WorkSchedule.create({
      name,
      type,
      work_days,
      start_time,
      lunch_start: lunch_start || null,
      lunch_end: lunch_end || null,
      end_time,
      day_rules: day_rules || null,
      tolerance_minutes: tolerance_minutes ?? 10,
      weekly_hours,
      has_alternating_saturdays: has_alternating_saturdays ?? false,
    });

    return res.status(201).json({ success: true, schedule });
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const schedule = await WorkSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Escala não encontrada' });
    }

    const {
      name,
      type,
      work_days,
      start_time,
      lunch_start,
      lunch_end,
      end_time,
      day_rules,
      tolerance_minutes,
      weekly_hours,
      has_alternating_saturdays,
    } = req.body;

    await schedule.update({
      name: name ?? schedule.name,
      type: type ?? schedule.type,
      work_days: work_days ?? schedule.work_days,
      start_time: start_time ?? schedule.start_time,
      lunch_start: lunch_start ?? schedule.lunch_start,
      lunch_end: lunch_end ?? schedule.lunch_end,
      end_time: end_time ?? schedule.end_time,
      day_rules: day_rules ?? schedule.day_rules,
      tolerance_minutes: tolerance_minutes ?? schedule.tolerance_minutes,
      weekly_hours: weekly_hours ?? schedule.weekly_hours,
      has_alternating_saturdays:
        has_alternating_saturdays ?? schedule.has_alternating_saturdays,
    });

    return res.json({ success: true, schedule });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await WorkSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Escala não encontrada' });
    }

    await schedule.destroy();
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  list,
  create,
  update,
  remove,
};
