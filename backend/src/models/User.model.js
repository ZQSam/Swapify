import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    uiucVerified: { type: Boolean, default: false },
    nickname: { type: String, required: true },
    passwordHash: { type: String, required: true },
    avatar: String,
    bio: String,
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
