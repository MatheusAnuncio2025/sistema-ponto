const requireRole = (roleOrRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
  }

  const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  if (req.user.role === 'admin') {
    return next();
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
  }

  return next();
};

module.exports = requireRole;
