const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('./task.controller');

const { protect, authorize } = require('../auth/auth.middleware'); // Auth + role
const checkTaskOwnership = require('./ownership.middleware'); // Ownership
const validateRequest = require('../middlewares/validation.middleware'); // Validation error handler
const {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
} = require('./task.validation'); // DTO rules

// Apply auth to all task routes
router.use(protect);

/**
 * @route   POST /tasks
 * @desc    Create a new task
 * @access  Private (User/Admin)
 */
router.post(
  '/',
  authorize('user', 'admin'),
  createTaskValidation,
  validateRequest,
  createTask
);

/**
 * @route   GET /tasks
 * @desc    Get all tasks
 * @access  Private
 */
router.get('/', authorize('user', 'admin'), getTasks);

/**
 * @route   GET /tasks/:id
 * @desc    Get single task
 * @access  Private (Owner/Admin)
 */
router.get(
  '/:id',
  taskIdValidation,
  validateRequest,
  checkTaskOwnership,
  getTaskById
);

/**
 * @route   PUT /tasks/:id
 * @desc    Update a task
 * @access  Private (Owner/Admin)
 */
router.put(
  '/:id',
  updateTaskValidation,
  validateRequest,
  checkTaskOwnership,
  updateTask
);

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete a task
 * @access  Private (Owner/Admin)
 */
router.delete(
  '/:id',
  taskIdValidation,
  validateRequest,
  checkTaskOwnership,
  deleteTask
);

module.exports = router;