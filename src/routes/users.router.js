import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/users.controller.js';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';

const router = Router();

router.get('/', auth, authorize(PERMISSIONS.VIEW_USERS), getUsers);
router.patch('/:uid/role', auth, authorize(PERMISSIONS.CHANGE_USER_ROLE), updateUserRole);

export default router;
