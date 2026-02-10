const express = require('express');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const adminDashboardController = require('../controllers/adminDashboard.controller');

const router = express.Router();
const adminRoles = ['admin', 'hr', 'supervisor', 'coordinator'];

router.get(
  '/dashboard',
  authMiddleware,
  requireRole(adminRoles),
  adminDashboardController.getDashboard
);

router.post(
  '/reprocess-hours',
  authMiddleware,
  requireRole(adminRoles),
  adminDashboardController.reprocessHours
);

router.get(
  '/reprocess-logs',
  authMiddleware,
  requireRole(adminRoles),
  adminDashboardController.listReprocessLogs
);

module.exports = router;
