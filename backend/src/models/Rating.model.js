import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

export const Rating = mongoose.model("Rating", ratingSchema);
