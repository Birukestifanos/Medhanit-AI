import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select("_id fullName email role active");
    console.log("✅ Fetched users:", users.map(u => ({ id: u._id, email: u.email, role: u.role })));
    res.json(users);
  } catch (error) {
    console.error("🔐 Get users error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role, phone, address, organization, active } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: "Full name, email, password, and role are required" });
    }
    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({
      fullName,
      email,
      hashedPassword,
      role,
      phone: phone || "",
      address: address || "",
      organization: organization || "Medanit",
      active: active !== undefined ? active : true,
    });
    await user.save();
    console.log("✅ User created:", { id: user._id, email, role });
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    console.error("🔐 Create user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, role } = req.body;
    if (!fullName || !email || !role) {
      return res.status(400).json({ error: "Full name, email, and role are required" });
    }
    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.fullName = fullName;
    user.email = email;
    user.role = role;
    await user.save();
    console.log("✅ User updated:", { id, email, role });
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    console.error("🔐 Update user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (typeof active !== "boolean") {
      return res.status(400).json({ error: "Active status must be a boolean" });
    }
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.active = active;
    await user.save();
    console.log("✅ User status toggled:", { id, email: user.email, active });
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    console.error("🔐 Toggle user status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("✅ User deleted:", { id, email: user.email });
    res.status(204).send();
  } catch (error) {
    console.error("🔐 Delete user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};