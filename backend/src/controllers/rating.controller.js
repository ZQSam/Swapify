import { z } from "zod";
import { Rating } from "../models/Rating.model.js";
import { User } from "../models/User.model.js";

const createRatingSchema = z.object({
  rateeId: z.string(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const createRating = async (req, res) => {
  const { rateeId, score, comment } = createRatingSchema.parse(req.body);

  // Check if ratee exists
  const rateeUser = await User.findById(rateeId);
  if (!rateeUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // Cannot rate yourself
  if (rateeId === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot rate yourself" });
  }

  // Check if rating already exists
  const existing = await Rating.findOne({
    rater: req.user._id,
    ratee: rateeId
  });

  let rating;
  if (existing) {
    // Update existing rating
    existing.score = score;
    existing.comment = comment;
    rating = await existing.save();
  } else {
    // Create new rating
    rating = await Rating.create({
      rater: req.user._id,
      ratee: rateeId,
      score,
      comment
    });
  }

  // Recalculate average rating for ratee
  const ratings = await Rating.find({ ratee: rateeId });
  const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

  await User.findByIdAndUpdate(rateeId, {
    averageRating: avgRating,
    ratingCount: ratings.length
  });

  res.status(201).json({ rating });
};

export const getUserRatings = async (req, res) => {
  const ratings = await Rating.find({ ratee: req.params.id })
    .populate('rater', 'nickname avatar')
    .sort({ createdAt: -1 });

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    ratings,
    averageRating: user.averageRating,
    totalCount: user.ratingCount
  });
};

export const getExistingRating = async (req, res) => {
  const targetUserId = req.params.id;

  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (targetUserId === req.user._id.toString()) {
    return res.json({ existingRating: null });
  }

  const existingRating = await Rating.findOne({
    rater: req.user._id,
    ratee: targetUserId
  });

  res.json({
    existingRating: existingRating ? {
      _id: existingRating._id,
      score: existingRating.score,
      comment: existingRating.comment
    } : null
  });
};
