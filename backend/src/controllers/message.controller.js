import { Message } from "../models/Message.model.js";
import { User } from "../models/User.model.js";
import { PurchaseRequest } from "../models/PurchaseRequest.model.js";
import mongoose from "mongoose";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

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

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      messageType: "text",
      content,
    });

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

export const sendPurchaseRequestMessage = async (req, res) => {
  try {
    const { receiverId, purchaseRequestId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !purchaseRequestId) {
      return res.status(400).json({
        error: "Receiver ID and purchase request ID are required",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const purchaseRequest = await PurchaseRequest.findById(
      purchaseRequestId
    ).populate("book");
    if (!purchaseRequest) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    if (purchaseRequest.buyer.toString() !== senderId.toString()) {
      return res.status(403).json({
        error: "You can only send messages for your own purchase requests",
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      messageType: "purchase_request",
      content: content || "I'm interested in this book",
      purchaseRequest: purchaseRequestId,
    });

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

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "nickname email")
      .populate("receiver", "nickname email");

    const conversationsMap = new Map();

    for (const message of messages) {
      const otherUser =
        message.sender._id.toString() === userId.toString()
          ? message.receiver
          : message.sender;

      const otherUserId = otherUser._id.toString();

      if (!conversationsMap.has(otherUserId)) {
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

    const conversations = Array.from(conversationsMap.values());

    res.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getMessagesWith = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
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

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.receiver.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only mark your own messages as read" });
    }

    message.read = true;
    await message.save();

    res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
};

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
