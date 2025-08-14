const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // Si no hay un objeto de administrador o el rol no coincide con el requerido
    if (!req.admin || req.admin.role !== requiredRole) {
      return res
        .status(403)
        .json({
          message: "Acceso denegado. No tienes los permisos necesarios.",
        });
    }
    next();
  };
};

module.exports = roleMiddleware;
