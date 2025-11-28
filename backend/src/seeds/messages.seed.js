// Seed messages for testing
// This will be populated with actual user and purchase request IDs during seeding

export const messagesData = [
  // Conversation 1: User 1 (John) and User 2 (Jane) about a book
  {
    senderEmail: "jane.doe@illinois.edu",
    receiverEmail: "john.doe@illinois.edu",
    messageType: "text",
    content: "Yes, it's still available! It's in great condition.",
    read: false,
  },
  {
    senderEmail: "john.doe@illinois.edu",
    receiverEmail: "jane.doe@illinois.edu",
    messageType: "text",
    content: "Great! Can we meet at the library tomorrow?",
    read: true,
  },

  // Conversation 2: User 3 (Alex) and User 4 (Emily) about a textbook
  {
    senderEmail: "alex.smith@illinois.edu",
    receiverEmail: "emily.chen@illinois.edu",
    messageType: "text",
    content: "Hello! I'm interested in your Calculus book.",
    read: true,
  },
  {
    senderEmail: "emily.chen@illinois.edu",
    receiverEmail: "alex.smith@illinois.edu",
    messageType: "text",
    content: "Hi Alex! Yes, I still have it. It has some highlights but otherwise good.",
    read: false,
  },

  // Conversation 3: User 5 (Mike) and User 1 (John)
  {
    senderEmail: "mike.johnson@illinois.edu",
    receiverEmail: "john.doe@illinois.edu",
    messageType: "text",
    content: "Hey, do you still need a Physics textbook?",
    read: false,
  },

  // Purchase request message: John requests to buy Fluent React from Jane
  {
    senderEmail: "john.doe@illinois.edu",
    receiverEmail: "jane.doe@illinois.edu",
    messageType: "purchase_request",
    purchaseRequestIndex: 0, // References first purchase request
    content: "I'd like to buy this book",
    read: false,
  },
];
