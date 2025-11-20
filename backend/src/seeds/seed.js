import "dotenv/config";
import mongoose from "mongoose";
import { Course } from "../models/Course.model.js";
import { BookTemplate } from "../models/BookTemplate.model.js";
import { User } from "../models/User.model.js";
import { coursesData } from "./courses.seed.js";
import { bookTemplatesData } from "./bookTemplates.seed.js";
import { usersData } from "./users.seed.js";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Course.deleteMany({});
    await BookTemplate.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    await Course.insertMany(coursesData);
    console.log(`Inserted ${coursesData.length} courses`);

    await BookTemplate.insertMany(bookTemplatesData);
    console.log(`Inserted ${bookTemplatesData.length} book templates`);

    await User.insertMany(usersData);
    console.log(`Inserted ${usersData.length} test users`);

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
