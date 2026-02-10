const { validationResult } = require('express-validator');
const { SystemSetting } = require('../models');

const defaultSettings = {
  allow_admin_out_of_schedule: true,
  allow_hr_out_of_schedule: true,
  allow_supervisor_out_of_schedule: true,
  allow_coordinator_out_of_schedule: true,
  allow_manager_out_of_schedule: false,
  admin_logo_data: null,
};

const getOrCreate = async () => {
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = await SystemSetting.create(defaultSettings);
  }
  return settings;
};

const get = async (req, res, next) => {
  try {
    const settings = await getOrCreate();
    return res.json({ success: true, settings });
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

    const settings = await getOrCreate();
    const payload = {};
    const fields = [
      "allow_admin_out_of_schedule",
      "allow_hr_out_of_schedule",
      "allow_supervisor_out_of_schedule",
      "allow_coordinator_out_of_schedule",
      "allow_manager_out_of_schedule",
      "admin_logo_data",
    ];

    fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        payload[field] = req.body[field];
      }
    });

    await settings.update(payload);
    return res.json({ success: true, settings });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  get,
  update,
};
