const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const workLocationsController = require('../controllers/workLocations.controller');

const router = express.Router();

router.get('/', authMiddleware, workLocationsController.list);

router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('latitude').isNumeric().withMessage('Latitude inválida'),
    body('longitude').isNumeric().withMessage('Longitude inválida'),
    body('radius').optional().isInt({ min: 10 }).withMessage('Raio deve ser >= 10m'),
  ],
  workLocationsController.create
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  [
    body('name').optional().notEmpty().withMessage('Nome inválido'),
    body('latitude').optional().isNumeric().withMessage('Latitude inválida'),
    body('longitude').optional().isNumeric().withMessage('Longitude inválida'),
    body('radius').optional().isInt({ min: 10 }).withMessage('Raio deve ser >= 10m'),
    body('is_active').optional().isBoolean().withMessage('Status inválido'),
  ],
  workLocationsController.update
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  workLocationsController.deactivate
);

module.exports = router;
