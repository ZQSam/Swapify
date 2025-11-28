import { Message } from "../models/Message.model.js";
import { User } from "../models/User.model.js";
import { PurchaseRequest } from "../models/PurchaseRequest.model.js";
import mongoose from "mongoose";

// Send a text message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    // Validate inputs
    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ error: "Receiver ID and content are required" });
    }

    if (content.length > 2000) {
      return res
        .status(400)
        .json({ error: "Message content cannot exceed 2000 characters" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Cannot send message to self
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      messageType: "text",
      content,
    });

    // Populate sender and receiver info
    await message.populate([
      { path: "sender", select: "nickname email" },
      { path: "receiver", select: "nickname email" },
    ]);

    res.status(201).json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Send a purchase request message
export const sendPurchaseRequestMessage = async (req, res) => {
  try {
    const { receiverId, purchaseRequestId, content } = req.body;
    const senderId = req.user._id;

    // Validate inputs
    if (!receiverId || !purchaseRequestId) {
      return res.status(400).json({
        error: "Receiver ID and purchase request ID are required",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Check if purchase request exists
    const purchaseRequest = await PurchaseRequest.findById(
      purchaseRequestId
    ).populate("book");
    if (!purchaseRequest) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    // Verify the sender is the buyer of this purchase request
    if (purchaseRequest.buyer.toString() !== senderId.toString()) {
      return res.status(403).json({
        error: "You can only send messages for your own purchase requests",
      });
    }

    // Cannot send message to self
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      messageType: "purchase_request",
      content: content || "I'm interested in this book",
      purchaseRequest: purchaseRequestId,
    });

    // Populate all fields
    await message.populate([
      { path: "sender", select: "nickname email" },
      { path: "receiver", select: "nickname email" },
      {
        path: "purchaseRequest",
        populate: { path: "book", select: "title price image" },
      },
    ]);

    res.status(201).json({ message });
  } catch (error) {
    console.error("Send purchase request message error:", error);
    res.status(500).json({ error: "Failed to send purchase request message" });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "nickname email")
      .populate("receiver", "nickname email");

    // Build conversations map
    const conversationsMap = new Map();

    for (const message of messages) {
      // Determine the other user in the conversation
      const otherUser =
        message.sender._id.toString() === userId.toString()
          ? message.receiver
          : message.sender;

      const otherUserId = otherUser._id.toString();

      // If this conversation not yet in map, add it
      if (!conversationsMap.has(otherUserId)) {
        // Count unread messages from this user
        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
          receiver: userId,
          read: false,
        });

        conversationsMap.set(otherUserId, {
          user: {
            id: otherUser._id,
            nickname: otherUser.nickname,
            email: otherUser.email,
          },
          lastMessage: {
            content: message.content || "[Purchase Request]",
            createdAt: message.createdAt,
            read: message.read,
            messageType: message.messageType,
          },
          unreadCount,
        });
      }
    }

    // Convert map to array and sort by last message time
    const conversations = Array.from(conversationsMap.values());

    res.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Get all messages with a specific user
export const getMessagesWith = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.params;

    // Validate other user ID
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all messages between these two users
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 }) // Oldest first
      .populate("sender", "nickname email")
      .populate("receiver", "nickname email")
      .populate({
        path: "purchaseRequest",
        populate: [
          { path: "book", select: "title author price image" },
          { path: "buyer", select: "nickname email" },
          { path: "seller", select: "nickname email" },
        ],
      });

    // Mark all unread messages from other user as read
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        read: false,
      },
      { read: true }
    );

    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Mark a message as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    // Validate message ID
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    // Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Can only mark messages sent to you as read
    if (message.receiver.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only mark your own messages as read" });
    }

    // Update read status
    message.read = true;
    await message.save();

    res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      read: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};
