// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerRoutes = require("./routes/swagger.routes");

const authRoutes = require("./auth/auth.routes");

// --- Redis & Rate Limiter ---
const rateLimit = require("express-rate-limit");

// --- CREATE EXPRESS APP ---
const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Swagger docs route
app.use("/api-docs", swaggerRoutes);

// --- Rate Limiter (Memory-based, works without Redis) ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // max requests per IP
  message: "Too many requests, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

console.log("⚡ Using in-memory rate limiter");

app.use(limiter);

// --- ROUTES ---
app.use("/tasks", require("./tasks/task.routes"));
app.use("/api/v1/auth", authRoutes);

// Auth middleware
const { authenticate, authorize } = require("./auth/auth.middleware");

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
  res.status(200).json({ 
    status: "OK", 
    message: "TaskHub API running",
    rateLimiter: "Memory"
  });
});

// --- Central Error Handler (last middleware) ---
const errorHandler = require("./middlewares/error.middleware");
app.use(errorHandler);

module.exports = app;

/* ============================================================================
 * 🚀 DEPLOYMENT: ADD REDIS FOR PRODUCTION
 * ============================================================================
 * 
 * To enable Redis-based rate limiting for production deployment:
 * 
 * 1️⃣ INSTALL DEPENDENCIES:
 *    npm install ioredis rate-limit-redis
 * 
 * 2️⃣ ADD REDIS CONNECTION (after line 11):
 *    const { RedisStore } = require("rate-limit-redis");
 *    const Redis = require("ioredis");
 * 
 *    const redisClient = new Redis({
 *      host: process.env.REDIS_HOST || "127.0.0.1",
 *      port: process.env.REDIS_PORT || 6379,
 *      password: process.env.REDIS_PASSWORD || "",
 *      maxRetriesPerRequest: 3,
 *      retryStrategy(times) {
 *        if (times > 3) {
 *          console.log("⚠️  Redis unavailable, using memory fallback");
 *          return null;
 *        }
 *        return Math.min(times * 50, 2000);
 *      },
 *    });
 * 
 *    redisClient.on("connect", () => console.log("✅ Redis connected"));
 *    redisClient.on("error", (err) => console.log("⚠️  Redis error:", err.message));
 * 
 * 3️⃣ UPDATE RATE LIMITER (replace lines 23-30):
 *    let limiter;
 *    
 *    if (redisClient.status === "ready") {
 *      limiter = rateLimit({
 *        windowMs: 15 * 60 * 1000,
 *        max: 100,
 *        message: "Too many requests, try again later.",
 *        standardHeaders: true,
 *        legacyHeaders: false,
 *        store: new RedisStore({
 *          sendCommand: (...args) => redisClient.call(...args),
 *          prefix: "rl:",
 *        }),
 *      });
 *      console.log("⚡ Using Redis rate limiter");
 *    } else {
 *      // Fallback to memory store
 *      limiter = rateLimit({
 *        windowMs: 15 * 60 * 1000,
 *        max: 100,
 *        message: "Too many requests, try again later.",
 *        standardHeaders: true,
 *        legacyHeaders: false,
 *      });
 *      console.log("⚡ Using in-memory rate limiter (Redis unavailable)");
 *    }
 * 
 * 4️⃣ ADD TO .ENV FILE:
 *    REDIS_HOST=your-redis-host.com
 *    REDIS_PORT=6379
 *    REDIS_PASSWORD=your-redis-password
 * 
 * 5️⃣ GRACEFUL SHUTDOWN (add before module.exports):
 *    process.on("SIGTERM", () => {
 *      console.log("SIGTERM received, closing Redis connection");
 *      redisClient.quit();
 *    });
 * 
 * 6️⃣ UPDATE HEALTH CHECK (line 59):
 *    rateLimiter: redisClient?.status === "ready" ? "Redis" : "Memory"
 * 
 * ============================================================================
 * 📦 REDIS DEPLOYMENT OPTIONS:
 * ============================================================================
 * - AWS ElastiCache (Redis)
 * - Redis Cloud (redislabs.com)
 * - Upstash (serverless Redis)
 * - DigitalOcean Managed Redis
 * - Railway / Render Redis add-ons
 * 
 * 💡 BENEFITS OF REDIS IN PRODUCTION:
 * ✅ Distributed rate limiting across multiple server instances
 * ✅ Persistent rate limit data (survives server restarts)
 * ✅ Shared session storage
 * ✅ Better scalability for high-traffic apps
 * ============================================================================
 */