# Smart Campus Lost & Found

An AI-assisted campus recovery platform built with a React frontend and an Express/MongoDB backend. Users can report lost/found items, get automated match suggestions using image + text similarity, and coordinate returns through real-time chat.

## Overview

This project is designed for fast hackathon iteration while keeping the codebase readable for beginners and contributors.

Core goals:

- Make item reporting quick and mobile-friendly.
- Improve matching quality with AI-assisted scoring.
- Provide a trusted communication flow for returns.
- Keep moderation simple with item status lifecycle and history.

## Key Features

- JWT authentication (register, login, profile).
- Lost/found item reporting with image upload to ImageKit.
- AI image embeddings via MobileNet (`@tensorflow-models/mobilenet` + `@tensorflow/tfjs`).
- Fuzzy text matching via Fuse.js.
- Weighted final scoring and automatic match creation.
- Real-time messaging powered by Socket.io.
- Dashboard with active items, active matches, and history.
- Trust score reward for successful returns.

## Tech Stack

### Frontend

- React (Vite)
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- Socket.io client
- Lucide icons

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt
- Multer + ImageKit
- TensorFlow.js + MobileNet
- Fuse.js
- Socket.io

## Project Structure

```text
smart-campus-lost-found/
|- backend/
|  |- controllers/      # business logic
|  |- middleware/       # auth + error handlers
|  |- models/           # mongoose schemas
|  |- routes/           # API route definitions
|  |- services/         # AI matching + image upload
|  `- server.js         # app + socket bootstrap
|- frontend/
|  |- src/components/   # reusable UI
|  |- src/context/      # auth context
|  |- src/pages/        # route pages
|  `- src/App.jsx       # route wiring
`- README.md
```

## How It Works

1. A user reports a lost/found item with photo + metadata.
2. Backend uploads image to ImageKit and stores `imageUrl`.
3. MobileNet extracts an embedding vector from the image.
4. System finds opposite-type active candidates (`lost` vs `found`).
5. Text similarity is computed with Fuse.js.
6. Image similarity uses cosine similarity.
7. Final score is computed:

$$
	ext{finalScore} = 0.7 \times \text{imageScore} + 0.3 \times \text{textScore}
$$

8. If `finalScore >= 0.7`, a `Match` document is created (deduplicated).
9. Users chat to verify and complete return.
10. On owner confirmation, both items are resolved and finder trust score increments.

## Prerequisites

- Node.js 18+ recommended
- npm 9+
- MongoDB Atlas (or local MongoDB URI)
- ImageKit account and credentials

## Environment Variables

Create `backend/.env` with:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Notes:

- Frontend currently uses hardcoded API URL `http://localhost:5000` in page components.
- Keep backend running on port `5000` during local development unless you also update frontend URLs.

## Local Development Setup

### 1) Clone and install dependencies

```bash
git clone <your-repo-url>
cd smart-campus-lost-found

cd backend
npm install

cd ../frontend
npm install
```

### 2) Start backend

```bash
cd backend
node server.js
```

Expected backend URL: `http://localhost:5000`

### 3) Start frontend

```bash
cd frontend
npm run dev
```

Expected frontend URL: `http://localhost:5173`

## Available Scripts

### Frontend (`frontend/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

### Backend (`backend/package.json`)

No dedicated run script is currently defined. Use:

- `node server.js` - start backend API + Socket.io server

## API Reference

Base URL: `http://localhost:5000/api`

### Auth Routes

- `POST /auth/register` - register user
- `POST /auth/login` - login user
- `GET /auth/profile` - get current profile (protected)

### Item Routes

- `GET /items` - list active items (supports `type`, `category`, `search` query params)
- `GET /items/me` - list all items posted by current user (protected)
- `GET /items/:id` - item details
- `POST /items` - create item report (protected, multipart with `image` file)
- `PUT /items/:id/status` - update status (protected)

### Match Routes

- `GET /matches` - list matches related to current user (protected)
- `PUT /matches/:id/status` - set match status (protected)
- `PUT /matches/:id/confirm` - owner confirms return and rewards finder (protected)

### Chat Routes

- `GET /chats` - get current user chats (protected)
- `GET /chats/match/:matchId` - get/create chat from match (protected)
- `POST /chats/item/:itemId` - get/create direct chat from item (protected)
- `GET /chats/:chatId` - chat metadata (protected)
- `GET /chats/:chatId/messages` - chat messages (protected)
- `POST /chats/:chatId/messages` - send message (protected)

### Auth Header Format

```http
Authorization: Bearer <jwt_token>
```

## Socket.io Events

Client emits:

- `join_room` with `chatId`

Server emits:

- `receive_message` with populated message payload

## Data Model Summary

### User

- `name`, `email`, `password`, `collegeId`, `trustScore`

### Item

- `title`, `description`, `category`, `imageUrl`, `type`, `location`, `date`, `status`, `embeddingVector`, `postedBy`

### Match

- `lostItemId`, `foundItemId`, `imageScore`, `textScore`, `finalScore`, `status`

### Chat

- `itemId`, `participants[]`

### Message

- `chatId`, `sender`, `content`, `read`

## Validation and Business Rules

- Registration email is currently restricted to `heritageit.edu.in` format.
- `collegeId` must be 7 digits.
- Item creator only can change that item's status.
- Only authorized chat participants can access/send messages.
- Only the user who lost the item can confirm a return.

## Known Limitations

- Backend has no `npm start` or `npm run dev` script yet.
- API base URL is hardcoded in frontend pages.
- No automated tests are configured.
- No role-based moderation/admin panel.

## Suggested Improvements

- Add `.env` support for frontend API URL (e.g., `VITE_API_BASE_URL`).
- Add backend scripts (`dev`, `start`) with nodemon.
- Add unit/integration tests for auth, item, and match flows.
- Add rate limiting and stronger validation for production.
- Add deployment guides (Render/Railway + Vercel/Netlify).

## Troubleshooting

### Backend fails to start

- Check `backend/.env` exists and keys are valid.
- Verify MongoDB URI connectivity.
- Ensure port `5000` is free.

### Image upload fails

- Verify ImageKit keys and URL endpoint.
- Confirm request includes multipart file field named `image`.

### No matches generated

- Ensure uploaded image is valid and embedding extraction succeeds.
- Confirm there are opposite-type active items in DB.
- Match creation requires `finalScore >= 0.7`.

### Chat not receiving live messages

- Confirm frontend connects to backend Socket.io endpoint.
- Ensure room join event is emitted with valid `chatId`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request with a clear summary and screenshots/API samples where relevant

## License

This project currently uses the license declared in each package (`ISC`).
