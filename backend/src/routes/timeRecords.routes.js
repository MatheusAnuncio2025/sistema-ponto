const express = require('express');
const { body } = require('express-validator');
const timeRecordsController = require('../controllers/timeRecords.controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  [
    body('record_type').notEmpty().withMessage('Tipo de registro é obrigatório'),
    body('latitude').optional().isNumeric().withMessage('Latitude inválida'),
    body('longitude').optional().isNumeric().withMessage('Longitude inválida'),
  ],
  timeRecordsController.create
);

router.get('/', authMiddleware, timeRecordsController.list);

module.exports = router;
