const { validationResult } = require('express-validator');
const { WorkLocation } = require('../models');

const list = async (req, res, next) => {
  try {
    const locations = await WorkLocation.findAll({
      order: [['created_at', 'DESC']],
    });
    return res.json({ success: true, locations });
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

    const { name, address, latitude, longitude, radius, is_active } = req.body;
    const location = await WorkLocation.create({
      name,
      address: address || null,
      latitude,
      longitude,
      radius: radius ?? 100,
      is_active: is_active ?? true,
    });

    return res.status(201).json({ success: true, location });
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
    const location = await WorkLocation.findByPk(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Local não encontrado' });
    }

    const { name, address, latitude, longitude, radius, is_active } = req.body;
    await location.update({
      name: name ?? location.name,
      address: address ?? location.address,
      latitude: latitude ?? location.latitude,
      longitude: longitude ?? location.longitude,
      radius: radius ?? location.radius,
      is_active: is_active ?? location.is_active,
    });

    return res.json({ success: true, location });
  } catch (error) {
    return next(error);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await WorkLocation.findByPk(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Local não encontrado' });
    }

    await location.update({ is_active: false });
    return res.json({ success: true, location });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  list,
  create,
  update,
  deactivate,
};
