# Swapify

A textbook exchange platform for UIUC students.

## Setup

### Prerequisites

- Node.js 18+
- MongoDB
- npm

### Installation

1. Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

2. Configure environment variables:

**Backend** - Create `backend/.env`:
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_BASE=http://localhost:4000
```

3. Seed the database with test data:

> Warning! This will erase existing data in the connected database.

```bash
cd backend
npm run seed
```

## Running the Application

Start both servers:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Test Accounts

Use these accounts for testing (already seeded):

| Name     | Email                  | Password    |
|----------|------------------------|-------------|
| John Doe | john.doe@illinois.edu  | password123 |
| Jane Doe | jane.doe@illinois.edu  | password123 |

Both accounts are pre-verified and ready to use.

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## Project Structure

```
swapify/
├── backend/          # Express API server
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── seeds/
└── frontend/         # React application
    └── src/
        ├── components/
        ├── pages/
        └── styles/
```
