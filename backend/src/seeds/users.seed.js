import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Test users for development and demo
// Password for all test users: "password123"
const hashedPassword = await bcrypt.hash("password123", 10);

// Fixed ObjectIds for consistent seeding
const USER_IDS = {
  JOHN: new mongoose.Types.ObjectId("6737a1000000000000000001"),
  JANE: new mongoose.Types.ObjectId("6737a1000000000000000002"),
  ALEX: new mongoose.Types.ObjectId("6737a1000000000000000003"),
  EMILY: new mongoose.Types.ObjectId("6737a1000000000000000004"),
  MIKE: new mongoose.Types.ObjectId("6737a1000000000000000005"),
};

export const usersData = [
  {
    _id: USER_IDS.JOHN,
    email: "john.doe@illinois.edu",
    uiucVerified: true,
    nickname: "John Doe",
    passwordHash: hashedPassword,
    bio: "Computer Science student, looking for textbooks",
  },
  {
    _id: USER_IDS.JANE,
    email: "jane.doe@illinois.edu",
    uiucVerified: true,
    nickname: "Jane Doe",
    passwordHash: hashedPassword,
    bio: "Business major, selling my old books",
  },
  {
    _id: USER_IDS.ALEX,
    email: "alex.smith@illinois.edu",
    uiucVerified: true,
    nickname: "Alex Smith",
    passwordHash: hashedPassword,
    bio: "Senior in ECE, graduating soon",
  },
  {
    _id: USER_IDS.EMILY,
    email: "emily.chen@illinois.edu",
    uiucVerified: true,
    nickname: "Emily Chen",
    passwordHash: hashedPassword,
    bio: "Math major, always buying and selling textbooks",
  },
  {
    _id: USER_IDS.MIKE,
    email: "mike.johnson@illinois.edu",
    uiucVerified: true,
    nickname: "Mike Johnson",
    passwordHash: hashedPassword,
    bio: "Physics student, have some books to sell",
  },
];

// Export USER_IDS for use in other seed files
export { USER_IDS };
