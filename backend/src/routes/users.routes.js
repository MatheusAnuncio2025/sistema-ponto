const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const usersController = require('../controllers/users.controller');

const router = express.Router();

const manageRoles = ['admin', 'hr', 'supervisor', 'coordinator'];
const availableRoles = ['admin', 'hr', 'supervisor', 'coordinator', 'manager', 'employee'];

router.get('/', authMiddleware, requireRole(manageRoles), usersController.list);

router.patch(
  '/:id/role',
  authMiddleware,
  requireRole(manageRoles),
  [body('role').isIn(availableRoles).withMessage('Role inválida')],
  usersController.updateRole
);

router.patch(
  '/:id/status',
  authMiddleware,
  requireRole(manageRoles),
  [body('is_active').isBoolean().withMessage('Status inválido')],
  usersController.updateStatus
);

module.exports = router;
