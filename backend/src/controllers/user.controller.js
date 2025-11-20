import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../models/User.model.js";

const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(32).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(72),
});

export const getProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  res.json({ user });
};

export const updateMe = async (req, res) => {
  const updates = updateProfileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true }
  ).select('-passwordHash');
  res.json({ user });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await User.findById(req.user._id);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash || "");
  if (!valid) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ message: "Password updated" });
};
