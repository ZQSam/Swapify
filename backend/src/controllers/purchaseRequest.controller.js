import { PurchaseRequest } from "../models/PurchaseRequest.model.js";

// Accept a purchase request (seller only)
export const acceptPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    // Verify user is the seller
    if (pr.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the seller can accept this request" });
    }

    // Verify status is pending
    if (pr.status !== "pending") {
      return res.status(400).json({ error: "Can only accept pending requests" });
    }

    pr.status = "accepted";
    await pr.save();

    const populatedPr = await PurchaseRequest.findById(id)
      .populate("buyer", "nickname email")
      .populate("seller", "nickname email")
      .populate("book", "title author price image");

    res.json({
      ok: true,
      purchaseRequest: populatedPr,
      message: "Purchase request accepted"
    });
  } catch (error) {
    console.error("Accept purchase request error:", error);
    res.status(500).json({ error: "Failed to accept purchase request" });
  }
};

// Reject a purchase request (seller only)
export const rejectPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    // Verify user is the seller
    if (pr.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the seller can reject this request" });
    }

    // Verify status is pending
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

// Cancel a purchase request (buyer only)
export const cancelPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    // Verify user is the buyer
    if (pr.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the buyer can cancel this request" });
    }

    // Verify status is pending
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
