const User = require("../users/user.model");
const bcrypt = require("bcryptjs");
const AuditLog = require("../models/auditLog.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("./token.util");

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    // 🔍 Audit Log
    await AuditLog.create({
      user: user._id,
      action: "USER_REGISTER",
      resource: "AUTH",
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // 🔍 Failed login audit
      await AuditLog.create({
        action: "LOGIN_FAILED",
        resource: "AUTH",
        ipAddress: req.ip,
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // 🔍 Failed login audit
      await AuditLog.create({
        user: user._id,
        action: "LOGIN_FAILED",
        resource: "AUTH",
        ipAddress: req.ip,
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔍 Successful login audit
    await AuditLog.create({
      user: user._id,
      action: "USER_LOGIN",
      resource: "AUTH",
      ipAddress: req.ip,
    });

    res.status(200).json({
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
    });
  } catch (error) {
    next(error);
  }
};
