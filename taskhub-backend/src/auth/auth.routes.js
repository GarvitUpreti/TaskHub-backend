const express = require("express");
const router = express.Router();
const { register, login } = require("./auth.controller");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & JWT issuance
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Public route.
 *       
 *       - Creates a new user account
 *       - Password is securely hashed
 *       - Role defaults to **user**
 *       
 *       After registration, user can log in to obtain a JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user and return JWT
 *     description: |
 *       Public route.
 *       
 *       - Authenticates user credentials
 *       - Returns a **JWT access token**
 *       
 *       🔐 This token must be sent in the `Authorization` header  
 *       for all protected routes:
 *       
 *       `Authorization: Bearer <token>`
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

module.exports = router;
