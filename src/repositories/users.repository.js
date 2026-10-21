import usersDao from '../dao/users.dao.js';

class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getAll() {
    return this.dao.getAll();
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getByEmail(email) {
    return this.dao.getByEmail(email);
  }

  create(userData) {
    return this.dao.create(userData);
  }

  updateRole(id, role) {
    return this.dao.updateRole(id, role);
  }
}

export default new UsersRepository(usersDao);
