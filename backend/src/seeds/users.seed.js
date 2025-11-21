import bcrypt from "bcrypt";

// Test users for development and demo
// Password for all test users: "password123"
const hashedPassword = await bcrypt.hash("password123", 10);

export const usersData = [
  {
    email: "john.doe@illinois.edu",
    uiucVerified: true,
    nickname: "John Doe",
    passwordHash: hashedPassword,
    bio: "Computer Science student, looking for textbooks",
  },
  {
    email: "jane.doe@illinois.edu",
    uiucVerified: true,
    nickname: "Jane Doe",
    passwordHash: hashedPassword,
    bio: "Business major, selling my old books",
  },
  {
    email: "alex.smith@illinois.edu",
    uiucVerified: true,
    nickname: "Alex Smith",
    passwordHash: hashedPassword,
    bio: "Senior in ECE, graduating soon",
  },
  {
    email: "emily.chen@illinois.edu",
    uiucVerified: true,
    nickname: "Emily Chen",
    passwordHash: hashedPassword,
    bio: "Math major, always buying and selling textbooks",
  },
  {
    email: "mike.johnson@illinois.edu",
    uiucVerified: true,
    nickname: "Mike Johnson",
    passwordHash: hashedPassword,
    bio: "Physics student, have some books to sell",
  },
];
