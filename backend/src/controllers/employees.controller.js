const { validationResult } = require('express-validator');
const { Employee, User, WorkSchedule, WorkLocation } = require('../models');

const list = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: WorkSchedule, as: 'workSchedule' },
        { model: WorkLocation, as: 'workLocation' },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({ success: true, employees });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { user_id: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: WorkSchedule, as: 'workSchedule' },
        { model: WorkLocation, as: 'workLocation' },
      ],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
    }

    return res.json({ success: true, employee });
  } catch (error) {
    return next(error);
  }
};

const updateSchedule = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { work_schedule_id } = req.body;

    const schedule = await WorkSchedule.findByPk(work_schedule_id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Escala não encontrada' });
    }

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
    }

    await employee.update({ work_schedule_id });
    return res.json({ success: true, employee });
  } catch (error) {
    return next(error);
  }
};

const updateLunch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { lunch_start, lunch_end } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
    }

    await employee.update({
      lunch_start: lunch_start || null,
      lunch_end: lunch_end || null,
    });

    return res.json({ success: true, employee });
  } catch (error) {
    return next(error);
  }
};

const setPunchOverride = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { override_until, reason } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
    }

    let until = null;
    if (override_until) {
      const parsed = new Date(override_until);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'Data inválida' });
      }
      until = parsed;
    } else {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      until = endOfDay;
    }

    await employee.update({
      punch_override_until: until,
      punch_override_by: req.user.id,
      punch_override_reason: reason ? String(reason).trim() : null,
    });

    return res.json({ success: true, employee });
  } catch (error) {
    return next(error);
  }
};

const clearPunchOverride = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
    }

    await employee.update({
      punch_override_until: null,
      punch_override_by: null,
      punch_override_reason: null,
    });

    return res.json({ success: true, employee });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  list,
  getMe,
  updateSchedule,
  updateLunch,
  setPunchOverride,
  clearPunchOverride,
};
