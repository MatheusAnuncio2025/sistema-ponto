const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token expirado ou inválido' });
  }
};

module.exports = authMiddleware;
