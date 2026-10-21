import usersRepository from '../repositories/users.repository.js';
import { ROLE_VALUES } from '../config/roles.js';
import { toPublicUser } from '../dto/user.dto.js';
import { HttpError } from '../utils/httpError.js';

class UsersService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAll() {
    const users = await this.repository.getAll();
    return users.map(toPublicUser);
  }

  async updateRole(targetId, role, requesterId) {
    if (!ROLE_VALUES.includes(role)) {
      throw new HttpError(400, `El rol debe ser uno de: ${ROLE_VALUES.join(', ')}`);
    }

    if (targetId === requesterId) {
      throw new HttpError(400, 'No podés cambiar tu propio rol');
    }

    const updated = await this.repository.updateRole(targetId, role);
    if (!updated) {
      throw new HttpError(404, 'Usuario no encontrado');
    }
    return toPublicUser(updated);
  }
}

export default new UsersService(usersRepository);
