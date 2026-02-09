const { validationResult } = require('express-validator');
const { SystemSetting } = require('../models');

const defaultSettings = {
  allow_admin_out_of_schedule: true,
  allow_hr_out_of_schedule: true,
  allow_supervisor_out_of_schedule: true,
  allow_coordinator_out_of_schedule: true,
  allow_manager_out_of_schedule: false,
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
    const payload = {
      allow_admin_out_of_schedule: req.body.allow_admin_out_of_schedule,
      allow_hr_out_of_schedule: req.body.allow_hr_out_of_schedule,
      allow_supervisor_out_of_schedule: req.body.allow_supervisor_out_of_schedule,
      allow_coordinator_out_of_schedule: req.body.allow_coordinator_out_of_schedule,
      allow_manager_out_of_schedule: req.body.allow_manager_out_of_schedule,
    };

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
