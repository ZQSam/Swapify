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

  if (request.status !== 'completed' && request.status !== 'accepted') {
    return res.status(400).json({ error: "Can only rate accepted or completed transactions" });
  }

  const isSeller = request.seller.toString() === req.user._id.toString();
  const isBuyer = request.buyer.toString() === req.user._id.toString();

  if (!isSeller && !isBuyer) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const ratee = isSeller ? request.buyer : request.seller;

  if (ratee.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot rate yourself" });
  }

  const existing = await Rating.findOne({
    rater: req.user._id,
    request: requestId
  });

  let rating;
  if (existing) {
    existing.score = score;
    existing.comment = comment;
    rating = await existing.save();
  } else {
    rating = await Rating.create({
      rater: req.user._id,
      ratee,
      request: requestId,
      score,
      comment
    });
  }

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

export const getRatableRequests = async (req, res) => {
  const targetUserId = req.params.id;

  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (targetUserId === req.user._id.toString()) {
    return res.json({ requests: [] });
  }

  const requests = await PurchaseRequest.find({
    $or: [
      { buyer: req.user._id, seller: targetUserId, status: { $in: ['accepted', 'completed'] } },
      { seller: req.user._id, buyer: targetUserId, status: { $in: ['accepted', 'completed'] } }
    ]
  }).populate('book', 'title');

  const requestsWithRatings = await Promise.all(
    requests.map(async (request) => {
      const existingRating = await Rating.findOne({
        rater: req.user._id,
        request: request._id
      });

      return {
        _id: request._id,
        book: request.book,
        status: request.status,
        createdAt: request.createdAt,
        existingRating: existingRating ? {
          _id: existingRating._id,
          score: existingRating.score,
          comment: existingRating.comment
        } : null
      };
    })
  );

  res.json({ requests: requestsWithRatings });
};
