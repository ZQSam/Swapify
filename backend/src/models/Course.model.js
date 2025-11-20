import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: String,
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
