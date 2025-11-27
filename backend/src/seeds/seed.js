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
import { coursesData } from "./courses.seed.js";
import { bookTemplatesData } from "./bookTemplates.seed.js";
import { usersData } from "./users.seed.js";
import { booksData } from "./books.seed.js";
import { messagesData } from "./messages.seed.js";

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
    await Message.deleteMany({});
    console.log("Cleared existing data");

    await Course.insertMany(coursesData);
    console.log(`Inserted ${coursesData.length} courses`);

    await BookTemplate.insertMany(bookTemplatesData);
    console.log(`Inserted ${bookTemplatesData.length} book templates`);

    const insertedUsers = await User.insertMany(usersData);
    console.log(`Inserted ${usersData.length} test users`);

    // Load book cover images and convert to base64
    const booksWithImages = booksData.map((book, index) => {
      const imagePath = path.join(__dirname, 'images', `book${index + 1}.jpg`);
      let imageBase64 = null;

      if (fs.existsSync(imagePath)) {
        try {
          const imageBuffer = fs.readFileSync(imagePath);
          imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
          console.log(`Loaded image for book ${index + 1}: ${book.title}`);
        } catch (error) {
          console.warn(`Failed to load image for book ${index + 1}:`, error.message);
        }
      } else {
        console.warn(`Image not found for book ${index + 1}: ${imagePath}`);
      }

      return {
        ...book,
        image: imageBase64
      };
    });

    // Distribute books among users
    const booksWithOwners = booksWithImages.map((book, index) => ({
      ...book,
      owner: insertedUsers[index % insertedUsers.length]._id
    }));

    await Book.insertMany(booksWithOwners);
    console.log(`Inserted ${booksData.length} books`);

    // Create messages with actual user IDs
    const messagesWithIds = await Promise.all(
      messagesData.map(async (msg) => {
        const sender = await User.findOne({ email: msg.senderEmail });
        const receiver = await User.findOne({ email: msg.receiverEmail });

        if (!sender || !receiver) {
          console.warn(`Skipping message: sender or receiver not found`);
          return null;
        }

        return {
          sender: sender._id,
          receiver: receiver._id,
          messageType: msg.messageType,
          content: msg.content,
          read: msg.read,
        };
      })
    );

    const validMessages = messagesWithIds.filter((msg) => msg !== null);
    if (validMessages.length > 0) {
      await Message.insertMany(validMessages);
      console.log(`Inserted ${validMessages.length} messages`);
    }

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
