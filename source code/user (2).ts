import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  organization: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  role: { type: String, enum: ["admin", "staff"], required: true },
  active: { type: Boolean, default: true },
  avatar: { type: String, default: "" }, // Store base64 image
}, { timestamps: true });

export const UserModel = mongoose.model("User", userSchema);