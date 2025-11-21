import "dotenv/config";
import mongoose from "mongoose";
import { Course } from "../models/Course.model.js";
import { BookTemplate } from "../models/BookTemplate.model.js";
import { User } from "../models/User.model.js";
import { Book } from "../models/Book.model.js";
import { coursesData } from "./courses.seed.js";
import { bookTemplatesData } from "./bookTemplates.seed.js";
import { usersData } from "./users.seed.js";
import { booksData } from "./books.seed.js";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Course.deleteMany({});
    await BookTemplate.deleteMany({});
    await User.deleteMany({});
    await Book.deleteMany({});
    console.log("Cleared existing data");

    await Course.insertMany(coursesData);
    console.log(`Inserted ${coursesData.length} courses`);

    await BookTemplate.insertMany(bookTemplatesData);
    console.log(`Inserted ${bookTemplatesData.length} book templates`);

    const insertedUsers = await User.insertMany(usersData);
    console.log(`Inserted ${usersData.length} test users`);

    // Distribute books among users
    const booksWithOwners = booksData.map((book, index) => ({
      ...book,
      owner: insertedUsers[index % insertedUsers.length]._id
    }));

    await Book.insertMany(booksWithOwners);
    console.log(`Inserted ${booksData.length} books`);

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
