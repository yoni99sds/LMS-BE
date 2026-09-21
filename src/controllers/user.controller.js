import userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';

export const userController = {
  getUsers: catchAsync(async (req, res) => {
    // Read filtering/search/sorting from query params
    const { page, limit, sort, search, role, status } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const result = await userService.getUsers({
      filter,
      page,
      limit,
      sort,
      searchQuery: search
    });

    res.status(200).json({
      status: 'success',
      pagination: result.pagination,
      data: { users: result.data }
    });
  }),

  getUser: catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  }),

  updateUser: catchAsync(async (req, res) => {
    const user = await userService.updateUser(
      req.params.id,
      req.body,
      req.user._id,
      req.ip,
      req.headers['user-agent']
    );

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  }),

  deleteUser: catchAsync(async (req, res) => {
    const result = await userService.deleteUser(
      req.params.id,
      req.user._id,
      req.ip,
      req.headers['user-agent']
    );

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  }),

  getProfile: catchAsync(async (req, res) => {
    // Current logged in user profile (from protect middleware)
    res.status(200).json({
      status: 'success',
      data: { user: req.user }
    });
  })
};

export default userController;
