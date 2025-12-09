import { z } from "zod";
import { Rating } from "../models/Rating.model.js";
import { User } from "../models/User.model.js";
import { PurchaseRequest } from "../models/PurchaseRequest.model.js";

const createRatingSchema = z.object({
  rateeId: z.string(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const createRating = async (req, res) => {
  const { rateeId, score, comment } = createRatingSchema.parse(req.body);

  const rateeUser = await User.findById(rateeId);
  if (!rateeUser) {
    return res.status(404).json({ error: "User not found" });
  }

  if (rateeId === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot rate yourself" });
  }

  const completedRequest = await PurchaseRequest.findOne({
    $or: [
      { buyer: req.user._id, seller: rateeId },
      { buyer: rateeId, seller: req.user._id }
    ],
    status: 'completed'
  });

  if (!completedRequest) {
    return res.status(403).json({ error: "You can only rate users you've completed transactions with" });
  }

  const existing = await Rating.findOne({
    rater: req.user._id,
    ratee: rateeId
  });

  let rating;
  if (existing) {
    existing.score = score;
    existing.comment = comment;
    rating = await existing.save();
  } else {
    rating = await Rating.create({
      rater: req.user._id,
      ratee: rateeId,
      score,
      comment
    });
  }

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
    return res.json({ existingRating: null, canRate: false });
  }

  const existingRating = await Rating.findOne({
    rater: req.user._id,
    ratee: targetUserId
  });

  const completedRequest = await PurchaseRequest.findOne({
    $or: [
      { buyer: req.user._id, seller: targetUserId },
      { buyer: targetUserId, seller: req.user._id }
    ],
    status: 'completed'
  });

  res.json({
    existingRating: existingRating ? {
      _id: existingRating._id,
      score: existingRating.score,
      comment: existingRating.comment
    } : null,
    canRate: !!completedRequest
  });
};
