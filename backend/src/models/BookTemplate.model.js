import mongoose from "mongoose";

const bookTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: String,
    isbn: String,
    edition: String,
    year: Number,
    coverImage: String,
    commonCourses: [{
      code: String,
      name: String,
      term: String,
      section: String,
    }],
  },
  { timestamps: true }
);

export const BookTemplate = mongoose.model("BookTemplate", bookTemplateSchema);
