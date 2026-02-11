import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Zone from "../models/Zone.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, zoneName } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user
    const userData = { name, email, password, role: role || "USER" };

    // If zone_head, link to zone
    if (role === "ZONE_HEAD" && zoneName) {
      const zone = await Zone.findOne({ name: zoneName });
      if (zone) {
        userData.zone = zone._id;
      }
    }

    const user = await User.create(userData);

    // If zone_head, also update zone.head
    if (role === "ZONE_HEAD" && user.zone) {
      await Zone.findByIdAndUpdate(user.zone, { head: user._id });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("zone");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("zone");
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
