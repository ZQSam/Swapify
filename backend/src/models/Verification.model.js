import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    email: { type: String, index: true },
    codeHash: String,
    expiresAt: { type: Date, index: { expires: 0 } },
    consumed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Verification = mongoose.model("Verification", verificationSchema);
