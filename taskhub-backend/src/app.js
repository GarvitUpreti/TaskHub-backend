const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./auth/auth.routes");

// --- Redis & Rate Limiter ---
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const Redis = require("ioredis");

// Create Redis client
const redisClient = new Redis({
  host: "127.0.0.1", // Redis server IP
  port: 6379,        // default Redis port
  password: "",      // if your Redis has a password
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.log("❌ Redis error:", err));

// Create rate limiter
const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 100 requests per IP per window
  message: "Too many requests, try again later.",
});

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// --- Apply rate limiter globally ---
app.use(limiter);

// ROUTES
app.use("/tasks", require("./tasks/task.routes"));
app.use("/api/v1/auth", authRoutes);

const { authenticate, authorize } = require("./middleware/auth.middleware");

// Only admin can access
app.get("/api/v1/admin-only", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: `Welcome, admin ${req.user.id}!` });
});

// Any logged-in user can access
app.get("/api/v1/user-only", authenticate, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}!` });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "TaskHub API running" });
});

// Central error handler must come last
const errorHandler = require("./middlewares/error.middleware");
app.use(errorHandler);

module.exports = app;
