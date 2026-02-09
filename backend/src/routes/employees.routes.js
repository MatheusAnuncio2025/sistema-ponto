const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const employeesController = require('../controllers/employees.controller');

const router = express.Router();

router.get('/', authMiddleware, requireRole('admin'), employeesController.list);

router.patch(
  '/:id/work-schedule',
  authMiddleware,
  requireRole('admin'),
  [
    body('work_schedule_id')
      .notEmpty()
      .withMessage('Escala é obrigatória')
      .isUUID()
      .withMessage('Escala inválida'),
  ],
  employeesController.updateSchedule
);

router.patch(
  '/:id/lunch',
  authMiddleware,
  requireRole('admin'),
  [
    body('lunch_start').optional().isString().withMessage('Horário inválido'),
    body('lunch_end').optional().isString().withMessage('Horário inválido'),
  ],
  employeesController.updateLunch
);

router.post(
  '/:id/punch-override',
  authMiddleware,
  requireRole(['admin', 'hr', 'supervisor', 'coordinator']),
  [
    body('override_until')
      .optional()
      .isISO8601()
      .withMessage('Data inválida'),
    body('reason').optional().isString().withMessage('Motivo inválido'),
  ],
  employeesController.setPunchOverride
);

router.delete(
  '/:id/punch-override',
  authMiddleware,
  requireRole(['admin', 'hr', 'supervisor', 'coordinator']),
  employeesController.clearPunchOverride
);

module.exports = router;
