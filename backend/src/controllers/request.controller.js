import { z } from "zod";
import { PurchaseRequest } from "../models/PurchaseRequest.model.js";
import { Book } from "../models/Book.model.js";

const createRequestSchema = z.object({
  bookId: z.string(),
  message: z.string().optional()
});

export const createRequest = async (req, res) => {
  const { bookId, message } = createRequestSchema.parse(req.body);

  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (book.owner.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot request your own book" });
  }

  if (book.status !== 'available') {
    return res.status(400).json({ error: "Book not available" });
  }

  const existing = await PurchaseRequest.findOne({
    book: bookId,
    buyer: req.user._id,
    status: 'pending'
  });

  if (existing) {
    return res.status(400).json({ error: "Request already exists" });
  }

  const request = await PurchaseRequest.create({
    book: bookId,
    buyer: req.user._id,
    seller: book.owner,
    message
  });

  res.status(201).json({ request });
};

export const getReceivedRequests = async (req, res) => {
  const { status } = req.query;
  const query = { seller: req.user._id };
  if (status) query.status = status;

  const requests = await PurchaseRequest.find(query)
    .populate('book')
    .populate('buyer', 'nickname email averageRating')
    .sort({ createdAt: -1 });

  res.json({ requests });
};

export const getSentRequests = async (req, res) => {
  const requests = await PurchaseRequest.find({ buyer: req.user._id })
    .populate('book')
    .populate('seller', 'nickname email averageRating')
    .sort({ createdAt: -1 });

  res.json({ requests });
};

export const completeRequest = async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id).populate('book');

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: "Request already processed" });
  }

  request.status = 'completed';
  await request.save();

  await Book.findByIdAndUpdate(request.book._id, { status: 'closed' });

  await PurchaseRequest.updateMany(
    { book: request.book._id, status: 'pending', _id: { $ne: req.params.id } },
    { status: 'rejected' }
  );

  res.json({ request });
};

export const rejectRequest = async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: "Request already processed" });
  }

  request.status = 'rejected';
  await request.save();

  res.json({ request });
};

export const cancelRequest = async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.buyer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: "Cannot cancel processed request" });
  }

  request.status = 'cancelled';
  await request.save();

  res.json({ request });
};
