const { body, param } = require('express-validator');

/**
 * Validation rules for creating a task
 */
exports.createTaskValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
];

/**
 * Validation rules for updating a task
 */
exports.updateTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
];

/**
 * Validation rules for task ID in params
 */
exports.taskIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
];
