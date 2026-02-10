const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const settingsController = require('../controllers/settings.controller');

const router = express.Router();
const adminRoles = ['admin', 'hr', 'supervisor', 'coordinator'];

router.get('/', authMiddleware, requireRole(adminRoles), settingsController.get);

router.patch(
  '/',
  authMiddleware,
  requireRole(adminRoles),
  [
    body('allow_admin_out_of_schedule').optional().isBoolean(),
    body('allow_hr_out_of_schedule').optional().isBoolean(),
    body('allow_supervisor_out_of_schedule').optional().isBoolean(),
    body('allow_coordinator_out_of_schedule').optional().isBoolean(),
    body('allow_manager_out_of_schedule').optional().isBoolean(),
    body('admin_logo_data').optional().isString(),
  ],
  settingsController.update
);

module.exports = router;
