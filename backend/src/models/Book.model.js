import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: String,
    isbn: String,
    edition: String,
    year: Number,
    courseCode: { type: String, required: true },
    courseName: String,
    term: String,
    section: String,
    price: { type: Number, required: true },
    condition: { type: String, enum: ['new', 'used'], required: true },
    description: String,
    image: String,
    meetingLocation: String,
    status: { type: String, enum: ['available', 'pending', 'sold'], default: 'available' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);
