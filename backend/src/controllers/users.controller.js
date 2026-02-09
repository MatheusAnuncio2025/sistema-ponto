const { validationResult } = require('express-validator');
const { User, Employee } = require('../models');

const list = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at', 'updated_at'],
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: [
            'id',
            'employee_code',
            'department',
            'position',
            'hire_date',
            'work_schedule_id',
            'work_location_id',
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({ success: true, users });
  } catch (error) {
    return next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (req.user.id === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível alterar o próprio perfil para um nível inferior.',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    await user.update({ role });
    return res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    return next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { is_active } = req.body;

    if (req.user.id === id && !is_active) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível inativar o próprio usuário.',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    await user.update({ is_active });
    return res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  list,
  updateRole,
  updateStatus,
};
