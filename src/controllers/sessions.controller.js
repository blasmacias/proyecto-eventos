const notImplemented = (res, action) =>
  res.status(501).json({
    status: 'error',
    message: `${action} pendiente de implementación`
  });

export const register = (req, res) => notImplemented(res, 'Registro');

export const login = (req, res) => notImplemented(res, 'Login');

export const current = (req, res) => notImplemented(res, 'Usuario actual');
