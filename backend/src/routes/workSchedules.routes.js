const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const workSchedulesController = require('../controllers/workSchedules.controller');

const router = express.Router();

const validateWorkDays = (value) => {
  if (!Array.isArray(value)) return false;
  return value.every(
    (day) =>
      Number.isInteger(day) &&
      day >= 0 &&
      day <= 6
  );
};

const validateDayRules = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object') return false;
  return Object.keys(value).every((key) => {
    const day = Number(key);
    if (Number.isNaN(day) || day < 0 || day > 6) return false;
    const rule = value[key];
    if (!rule || typeof rule !== 'object') return false;
    return (
      (!rule.start_time || typeof rule.start_time === 'string') &&
      (!rule.end_time || typeof rule.end_time === 'string') &&
      (!rule.lunch_start || typeof rule.lunch_start === 'string') &&
      (!rule.lunch_end || typeof rule.lunch_end === 'string')
    );
  });
};

router.get('/', authMiddleware, workSchedulesController.list);

router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('type').isIn(['5x2', '6x1', 'custom']).withMessage('Tipo inválido'),
    body('work_days').custom(validateWorkDays).withMessage('Dias de trabalho inválidos'),
    body('start_time').notEmpty().withMessage('Hora de entrada é obrigatória'),
    body('end_time').notEmpty().withMessage('Hora de saída é obrigatória'),
    body('weekly_hours').isNumeric().withMessage('Horas semanais inválidas'),
    body('day_rules').optional().custom(validateDayRules).withMessage('Regras por dia inválidas'),
    body('tolerance_minutes').optional().isInt({ min: 0 }).withMessage('Tolerância inválida'),
    body('has_alternating_saturdays')
      .optional()
      .isBoolean()
      .withMessage('Campo inválido'),
  ],
  workSchedulesController.create
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  [
    body('name').optional().notEmpty().withMessage('Nome inválido'),
    body('type').optional().isIn(['5x2', '6x1', 'custom']).withMessage('Tipo inválido'),
    body('work_days').optional().custom(validateWorkDays).withMessage('Dias de trabalho inválidos'),
    body('start_time').optional().notEmpty().withMessage('Hora de entrada inválida'),
    body('end_time').optional().notEmpty().withMessage('Hora de saída inválida'),
    body('weekly_hours').optional().isNumeric().withMessage('Horas semanais inválidas'),
    body('day_rules').optional().custom(validateDayRules).withMessage('Regras por dia inválidas'),
    body('tolerance_minutes').optional().isInt({ min: 0 }).withMessage('Tolerância inválida'),
    body('has_alternating_saturdays')
      .optional()
      .isBoolean()
      .withMessage('Campo inválido'),
  ],
  workSchedulesController.update
);

router.delete('/:id', authMiddleware, requireRole('admin'), workSchedulesController.remove);

module.exports = router;
