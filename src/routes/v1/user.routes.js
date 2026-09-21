import express from 'express';
import userController from '../../controllers/user.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All routes here require authentication
router.use(protect);

router.get('/me', userController.getProfile);

// Admin-only user management
router.use(restrictTo('Admin'));

router.route('/')
  .get(userController.getUsers);

router.route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
