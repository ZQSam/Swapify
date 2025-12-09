import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Course } from "../models/Course.model.js";
import { BookTemplate } from "../models/BookTemplate.model.js";
import { User } from "../models/User.model.js";
import { Book } from "../models/Book.model.js";
import { Message } from "../models/Message.model.js";
import { PurchaseRequest } from "../models/PurchaseRequest.model.js";
import { Rating } from "../models/Rating.model.js";
import { coursesData } from "./courses.seed.js";
import { bookTemplatesData } from "./bookTemplates.seed.js";
import { usersData } from "./users.seed.js";
import { booksData } from "./books.seed.js";
import { messagesData } from "./messages.seed.js";
import { purchaseRequestsData } from "./purchaseRequests.seed.js";
import { ratingsData } from "./ratings.seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Course.deleteMany({});
    await BookTemplate.deleteMany({});
    await User.deleteMany({});
    await Book.deleteMany({});
    await PurchaseRequest.deleteMany({});
    await Message.deleteMany({});
    await Rating.deleteMany({});
    console.log("Cleared existing data");

    await Course.insertMany(coursesData);
    console.log(`Inserted ${coursesData.length} courses`);

    // Load book template cover images and convert to base64
    const bookTemplatesWithImages = bookTemplatesData.map((template, index) => {
      const imagePath = path.join(__dirname, 'images', `book${index + 1}.jpg`);
      let imageBase64 = null;

      if (fs.existsSync(imagePath)) {
        try {
          const imageBuffer = fs.readFileSync(imagePath);
          imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
          console.log(`Loaded cover image for template ${index + 1}: ${template.title}`);
        } catch (error) {
          console.warn(`Failed to load cover image for template ${index + 1}:`, error.message);
        }
      } else {
        console.warn(`Cover image not found for template ${index + 1}: ${imagePath}`);
      }

      return {
        ...template,
        coverImage: imageBase64
      };
    });

    await BookTemplate.insertMany(bookTemplatesWithImages);
    console.log(`Inserted ${bookTemplatesData.length} book templates`);

    const insertedUsers = await User.insertMany(usersData);
    console.log(`Inserted ${usersData.length} test users`);

    // Create a mapping of unique books (by ISBN or title) to image indices
    const uniqueBookMap = new Map();
    let imageCounter = 1;

    booksData.forEach((book) => {
      const bookKey = book.isbn || book.title; // Use ISBN if available, otherwise title
      if (!uniqueBookMap.has(bookKey)) {
        uniqueBookMap.set(bookKey, imageCounter);
        imageCounter++;
      }
    });

    // Load book cover images and convert to base64
    const booksWithImages = booksData.map((book) => {
      const bookKey = book.isbn || book.title;
      const imageIndex = uniqueBookMap.get(bookKey);
      const imagePath = path.join(__dirname, 'images', `book${imageIndex}.jpg`);
      let imageBase64 = null;

      if (fs.existsSync(imagePath)) {
        try {
          const imageBuffer = fs.readFileSync(imagePath);
          imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
          console.log(`Loaded image ${imageIndex} for book: ${book.title}`);
        } catch (error) {
          console.warn(`Failed to load image ${imageIndex} for book:`, error.message);
        }
      } else {
        console.warn(`Image not found for book: ${imagePath}`);
      }

      return {
        ...book,
        image: imageBase64
      };
    });

    // Distribute books among users
    const booksWithOwners = booksWithImages.map((book, index) => {
      let ownerId;

      if (book.ownerEmail) {
        // Find user by email if specified
        const owner = insertedUsers.find(u => u.email === book.ownerEmail);
        ownerId = owner ? owner._id : insertedUsers[index % insertedUsers.length]._id;
      } else {
        // Default distribution
        ownerId = insertedUsers[index % insertedUsers.length]._id;
      }

      const { ownerEmail, ...bookData } = book;
      return {
        ...bookData,
        owner: ownerId
      };
    });

    const insertedBooks = await Book.insertMany(booksWithOwners);
    console.log(`Inserted ${booksData.length} books`);

    // Create purchase requests with actual user and book IDs
    const purchaseRequestsWithIds = await Promise.all(
      purchaseRequestsData.map(async (pr) => {
        const buyer = await User.findOne({ email: pr.buyerEmail });
        const seller = await User.findOne({ email: pr.sellerEmail });
        const book = await Book.findOne({ title: pr.bookTitle });

        if (!buyer || !seller || !book) {
          console.warn(`Skipping purchase request: buyer, seller, or book not found`);
          return null;
        }

        return {
          buyer: buyer._id,
          seller: seller._id,
          book: book._id,
          status: pr.status,
          message: pr.message,
        };
      })
    );

    const validPurchaseRequests = purchaseRequestsWithIds.filter((pr) => pr !== null);
    let insertedPurchaseRequests = [];
    if (validPurchaseRequests.length > 0) {
      insertedPurchaseRequests = await PurchaseRequest.insertMany(validPurchaseRequests);
      console.log(`Inserted ${insertedPurchaseRequests.length} purchase requests`);
    }

    // Create messages with actual user IDs
    const messagesWithIds = await Promise.all(
      messagesData.map(async (msg) => {
        const sender = await User.findOne({ email: msg.senderEmail });
        const receiver = await User.findOne({ email: msg.receiverEmail });

        if (!sender || !receiver) {
          console.warn(`Skipping message: sender or receiver not found`);
          return null;
        }

        const messageData = {
          sender: sender._id,
          receiver: receiver._id,
          messageType: msg.messageType,
          read: msg.read,
        };

        // Handle purchase_request messages
        if (msg.messageType === 'purchase_request') {
          if (msg.purchaseRequestIndex !== undefined && insertedPurchaseRequests[msg.purchaseRequestIndex]) {
            messageData.purchaseRequest = insertedPurchaseRequests[msg.purchaseRequestIndex]._id;
            if (msg.content) {
              messageData.content = msg.content;
            }
          } else {
            console.warn(`Skipping purchase_request message: purchase request not found`);
            return null;
          }
        } else {
          // Text message
          messageData.content = msg.content;
        }

        return messageData;
      })
    );

    const validMessages = messagesWithIds.filter((msg) => msg !== null);
    if (validMessages.length > 0) {
      await Message.insertMany(validMessages);
      console.log(`Inserted ${validMessages.length} messages`);
    }

    const ratingsWithIds = await Promise.all(
      ratingsData.map(async (rating) => {
        const rater = await User.findOne({ email: rating.raterEmail });
        const ratee = await User.findOne({ email: rating.rateeEmail });

        if (!rater || !ratee) {
          console.warn(`Skipping rating: rater or ratee not found`);
          return null;
        }

        return {
          rater: rater._id,
          ratee: ratee._id,
          score: rating.score,
          comment: rating.comment,
        };
      })
    );

    const validRatings = ratingsWithIds.filter((r) => r !== null);
    if (validRatings.length > 0) {
      await Rating.insertMany(validRatings);
      console.log(`Inserted ${validRatings.length} ratings`);

      const userRatings = {};
      for (const rating of validRatings) {
        const rateeId = rating.ratee.toString();
        if (!userRatings[rateeId]) {
          userRatings[rateeId] = [];
        }
        userRatings[rateeId].push(rating.score);
      }

      for (const [userId, scores] of Object.entries(userRatings)) {
        const avgRating = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        await User.findByIdAndUpdate(userId, {
          averageRating: avgRating,
          ratingCount: scores.length,
        });
      }
      console.log(`Updated user average ratings`);
    }

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
