// src/controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";

interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  role?: "admin" | "staff";
}

const JWT_SECRET = process.env.JWT_SECRET || '9f8c7d6e5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d';
const TOKEN_EXPIRY = "7d";

// Helper to generate token
const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { userId, role, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body as SignupRequest;
    if (!fullName || !email || !password) {
      console.warn("🔒 Missing required fields for signup:", { fullName, email });
      return res.status(400).json({ error: "Full name, email, and password are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.warn("🔒 Email already exists:", email);
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({
      fullName,
      email,
      hashedPassword,
      role: role && ["admin", "staff"].includes(role) ? role : "staff",
      phone: "",
      address: "",
      organization: "Medanit",
      active: true,
      avatar: "",
    });

    await user.save();
    console.log("✅ User signed up:", { id: user._id, email, role: user.role });

    // ✅ Generate token and return in JSON (no cookie)
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      organization: user.organization || "",
      role: user.role,
      avatar: user.avatar || "",
      token,
    });
  } catch (error: any) {
    console.error("🔐 Signup error:", error.message, error.stack);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.warn("🔒 Missing email or password for login");
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      console.warn("🔒 User not found for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.active) {
      console.warn("🔒 Account deactivated for email:", email);
      return res.status(403).json({ error: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      console.warn("🔒 Invalid password for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ User logged in:", { id: user._id, email, role: user.role });

    // ✅ Generate token
    const token = generateToken(user._id.toString(), user.role);

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      organization: user.organization || "",
      role: user.role,
      avatar: user.avatar || "",
      token,
    });
  } catch (error: any) {
    console.error("🔐 Login error:", error.message, error.stack);
    res.status(500).json({ error: "Server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  // ✅ No cookie to clear – frontend will remove token from localStorage
  console.log("✅ User logged out");
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // ✅ Token already verified by middleware
    const user = (req as any).userDoc; // Attach full user from middleware

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      organization: user.organization || "",
      role: user.role,
      avatar: user.avatar || "",
    });
  } catch (error: any) {
    console.error("🔐 Get me error:", error.message, error.stack);
    res.status(401).json({ error: "Not authenticated" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).userDoc; // From middleware
    const { fullName, phone, address, organization, password, avatar } = req.body;

    // Validate inputs
    if (!fullName) {
      console.warn("🔒 Missing fullName for update-profile:", user._id);
      return res.status(400).json({ error: "Full name is required" });
    }

    // Validate avatar (base64 string)
    if (avatar) {
      const isValidBase64 = /^data:image\/(png|jpeg|jpg);base64,/.test(avatar);
      if (!isValidBase64) {
        console.warn("🔒 Invalid avatar format for update-profile:", user._id);
        return res.status(400).json({ error: "Avatar must be a valid base64 image (PNG/JPEG)" });
      }
      // Check size (limit to ~100KB)
      const sizeInBytes = Buffer.byteLength(avatar, 'utf8');
      if (sizeInBytes > 100 * 1024) {
        console.warn("🔒 Avatar size exceeds limit for update-profile:", user._id, sizeInBytes);
        return res.status(400).json({ error: "Avatar size exceeds 100KB limit" });
      }
    }

    // Prepare update object
    const updateData: any = { fullName, phone, address, organization };
    if (password) {
      if (password.length < 6) {
        console.warn("🔒 Password too short for update-profile:", user._id);
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      updateData.hashedPassword = await bcrypt.hash(password, 10);
    }
    if (avatar) {
      updateData.avatar = avatar;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      console.warn("🔒 User not found for update-profile:", user._id);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Profile updated:", { userId: updatedUser._id, email: updatedUser.email });
    res.json({
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone || "",
      address: updatedUser.address || "",
      organization: updatedUser.organization || "",
      role: updatedUser.role,
      avatar: updatedUser.avatar || "",
    });
  } catch (error: any) {
    console.error("🔐 Update profile error:", error.message, error.stack);
    res.status(500).json({ error: "Server error" });
  }
};