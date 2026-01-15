const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("./task.controller");

const { authenticate, authorize } = require("../auth/auth.middleware");
const checkTaskOwnership = require("./ownership.middleware");
const validateRequest = require("../middlewares/validation.middleware");
const {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
} = require("./task.validation");

// Apply authentication to all task routes
router.use(authenticate);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: |
 *       🔐 Protected route  
 *       Requires JWT authentication.
 *       
 *       - User: can create own tasks
 *       - Admin: can create tasks
 *     tags: [Tasks]
 *     responses:
 *       201:
 *         description: Task created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authorize("user", "admin"),
  createTaskValidation,
  validateRequest,
  createTask
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: |
 *       🔐 Protected route  
 *       Requires JWT authentication.
 *       
 *       - Admin: can view all tasks
 *       - User: can view only own tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authorize("user", "admin"), getTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     description: |
 *       🔐 Protected route  
 *       Requires JWT authentication.
 *       
 *       - Owner: can view the task
 *       - Admin: can view any task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task fetched successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.get(
  "/:id",
  taskIdValidation,
  validateRequest,
  checkTaskOwnership,
  getTaskById
);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: |
 *       🔐 Protected route  
 *       Requires JWT authentication.
 *       
 *       - Owner: can update the task
 *       - Admin: can update any task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  updateTaskValidation,
  validateRequest,
  checkTaskOwnership,
  updateTask
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: |
 *       🔐 Protected route  
 *       Requires JWT authentication.
 *       
 *       - Owner: can delete the task
 *       - Admin: can delete any task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  taskIdValidation,
  validateRequest,
  checkTaskOwnership,
  deleteTask
);

module.exports = router;
