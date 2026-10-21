import usersService from '../services/users.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAll();
    res.status(200).json({ status: 'success', payload: users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await usersService.updateRole(req.params.uid, req.body?.role, req.user.id);
    res.status(200).json({ status: 'success', payload: user });
  } catch (error) {
    next(error);
  }
};
