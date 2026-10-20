import usersDao from '../dao/users.dao.js';

class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getByEmail(email) {
    return this.dao.getByEmail(email);
  }

  create(userData) {
    return this.dao.create(userData);
  }
}

export default new UsersRepository(usersDao);
