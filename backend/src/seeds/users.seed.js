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
    averageRating: 4.8,
    ratingCount: 15,
  },
  {
    email: "jane.doe@illinois.edu",
    uiucVerified: true,
    nickname: "Jane Doe",
    passwordHash: hashedPassword,
    bio: "Business major, selling my old books",
    averageRating: 4.5,
    ratingCount: 8,
  },
];
