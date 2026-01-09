const Task = require('./task.model');

/**
 * Ownership guard for tasks
 * Allows access if:
 * - user owns the task OR
 * - user is admin
 */
const checkTaskOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Owner or admin can proceed
    if (
      task.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: not allowed to access this task',
      });
    }

    // Attach task for controller reuse
    req.task = task;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkTaskOwnership;