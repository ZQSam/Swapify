import { z } from "zod";
import { Rating } from "../models/Rating.model.js";
import { PurchaseRequest } from "../models/PurchaseRequest.model.js";
import { User } from "../models/User.model.js";

const createRatingSchema = z.object({
  requestId: z.string(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const createRating = async (req, res) => {
  const { requestId, score, comment } = createRatingSchema.parse(req.body);

  const request = await PurchaseRequest.findById(requestId);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.status !== 'completed') {
    return res.status(400).json({ error: "Can only rate completed transactions" });
  }

  const isSeller = request.seller.toString() === req.user._id.toString();
  const isBuyer = request.buyer.toString() === req.user._id.toString();

  if (!isSeller && !isBuyer) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const ratee = isSeller ? request.buyer : request.seller;

  const existing = await Rating.findOne({
    rater: req.user._id,
    request: requestId
  });

  if (existing) {
    return res.status(400).json({ error: "Already rated this transaction" });
  }

  if (ratee.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot rate yourself" });
  }

  const rating = await Rating.create({
    rater: req.user._id,
    ratee,
    request: requestId,
    score,
    comment
  });

  const ratings = await Rating.find({ ratee });
  const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

  await User.findByIdAndUpdate(ratee, {
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
