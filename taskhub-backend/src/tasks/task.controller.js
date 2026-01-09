const Task = require('../models/task.model');
const logAction = require('../middleware/auditLog.middleware'); // import the audit log helper

/**
 * @desc   Create a new task
 * @route  POST /tasks
 * @access Private (User/Admin)
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const task = await Task.create({
      title,
      description,
      owner: req.user.id,
    });

    // Audit log
    await logAction({
      userId: req.user.id,
      action: 'CREATE_TASK',
      collectionName: 'tasks',
      documentId: task._id,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all tasks
 * @route  GET /tasks
 * @access Private
 */
exports.getTasks = async (req, res, next) => {
  try {
    let tasks;

    if (req.user.role === 'admin') {
      tasks = await Task.find();
    } else {
      tasks = await Task.find({ owner: req.user.id });
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single task
 * @route  GET /tasks/:id
 * @access Private
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update task
 * @route  PUT /tasks/:id
 * @access Private
 */
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Audit log
    await logAction({
      userId: req.user.id,
      action: 'UPDATE_TASK',
      collectionName: 'tasks',
      documentId: task._id,
    });

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete task
 * @route  DELETE /tasks/:id
 * @access Private
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    await task.deleteOne();

    // Audit log
    await logAction({
      userId: req.user.id,
      action: 'DELETE_TASK',
      collectionName: 'tasks',
      documentId: task._id,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
