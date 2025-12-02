import { PurchaseRequest } from "../models/PurchaseRequest.model.js";
import { Book } from "../models/Book.model.js";

export const createPurchaseRequest = async (req, res) => {
  try {
    const { bookId, message } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: "Book ID is required" });
    }

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

    const populatedRequest = await PurchaseRequest.findById(request._id)
      .populate("buyer", "nickname email")
      .populate("seller", "nickname email")
      .populate("book", "title author price image");

    res.status(201).json({ request: populatedRequest });
  } catch (error) {
    console.error("Create purchase request error:", error);
    res.status(500).json({ error: "Failed to create purchase request" });
  }
};

export const checkExistingRequest = async (req, res) => {
  try {
    const { bookId } = req.params;

    const existingRequest = await PurchaseRequest.findOne({
      book: bookId,
      buyer: req.user._id,
      status: 'pending'
    });

    res.json({
      hasRequest: !!existingRequest,
      request: existingRequest
    });
  } catch (error) {
    console.error("Check existing request error:", error);
    res.status(500).json({ error: "Failed to check existing request" });
  }
};

export const completePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await PurchaseRequest.findById(id).populate("book");

    if (!pr) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    if (pr.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the seller can accept this request" });
    }

    if (pr.status !== "pending") {
      return res.status(400).json({ error: "Can only accept pending requests" });
    }

    pr.status = "completed";
    await pr.save();

    await Book.findByIdAndUpdate(pr.book._id, { status: "closed" });

    await PurchaseRequest.updateMany(
      { book: pr.book._id, status: "pending", _id: { $ne: id } },
      { status: "rejected" }
    );

    const populatedPr = await PurchaseRequest.findById(id)
      .populate("buyer", "nickname email")
      .populate("seller", "nickname email")
      .populate("book", "title author price image");

    res.json({
      ok: true,
      purchaseRequest: populatedPr,
      message: "Purchase request completed and book closed"
    });
  } catch (error) {
    console.error("Complete purchase request error:", error);
    res.status(500).json({ error: "Failed to complete purchase request" });
  }
};

export const rejectPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    if (pr.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the seller can reject this request" });
    }

    if (pr.status !== "pending") {
      return res.status(400).json({ error: "Can only reject pending requests" });
    }

    pr.status = "rejected";
    await pr.save();

    const populatedPr = await PurchaseRequest.findById(id)
      .populate("buyer", "nickname email")
      .populate("seller", "nickname email")
      .populate("book", "title author price image");

    res.json({
      ok: true,
      purchaseRequest: populatedPr,
      message: "Purchase request rejected"
    });
  } catch (error) {
    console.error("Reject purchase request error:", error);
    res.status(500).json({ error: "Failed to reject purchase request" });
  }
};

export const cancelPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    if (pr.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the buyer can cancel this request" });
    }

    if (pr.status !== "pending") {
      return res.status(400).json({ error: "Can only cancel pending requests" });
    }

    pr.status = "cancelled";
    await pr.save();

    const populatedPr = await PurchaseRequest.findById(id)
      .populate("buyer", "nickname email")
      .populate("seller", "nickname email")
      .populate("book", "title author price image");

    res.json({
      ok: true,
      purchaseRequest: populatedPr,
      message: "Purchase request cancelled"
    });
  } catch (error) {
    console.error("Cancel purchase request error:", error);
    res.status(500).json({ error: "Failed to cancel purchase request" });
  }
};
