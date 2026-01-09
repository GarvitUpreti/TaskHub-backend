const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./auth/auth.routes");

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ... other middlewares and routes
app.use('/tasks', require('./tasks/task.routes'));

// Central error handler must come last
const errorHandler = require('./middlewares/error.middleware');
app.use(errorHandler);

// ROUTES 
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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "TaskHub API running" });
});

module.exports = app;
