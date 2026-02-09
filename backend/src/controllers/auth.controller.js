const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Employee } = require('../models');

const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return { secret, expiresIn };
};

const signToken = (user) => {
  const { secret, expiresIn } = getJwtConfig();
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn }
  );
};

const generateEmployeeCode = (userId) => `EMP-${userId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

const ensureUniqueEmployeeCode = async (baseCode) => {
  let code = baseCode;
  let attempt = 0;
  while (attempt < 5) {
    const existing = await Employee.findOne({ where: { employee_code: code } });
    if (!existing) {
      return code;
    }
    attempt += 1;
    code = `${baseCode}-${attempt}`;
  }
  return `${baseCode}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'As senhas não conferem' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'E-mail já cadastrado' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
    });

    const baseCode = generateEmployeeCode(user.id);
    const employeeCode = await ensureUniqueEmployeeCode(baseCode);

    await Employee.create({
      user_id: user.id,
      employee_code: employeeCode,
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Usuário inativo' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    return res.json(user.toJSON());
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me,
};
