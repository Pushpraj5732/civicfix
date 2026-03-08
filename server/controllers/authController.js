import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Zone from "../models/Zone.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register — ONLY creates USER accounts (citizens)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // SECURITY: Always force role to USER — admin/zone_head are created via seed only
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "USER",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).populate("zone", "name");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If a role hint was provided, verify the user actually has that role
    if (role && user.role !== role) {
      const roleLabels = {
        ADMIN: "Admin",
        ZONE_HEAD: "Zone Head",
        USER: "Citizen",
      };
      return res.status(403).json({
        message: `This account is not registered as ${roleLabels[role] || role}. Your role is ${roleLabels[user.role] || user.role}.`,
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        zone: user.zone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me — Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("zone", "name");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
