# GPT Clone

A ChatGPT-inspired web application powered by Google Gemini. Built with React, Express, and MySQL.

## Features

- AI-powered conversations
- Saved chat history
- Create, reopen, and delete chats
- Collapsible sidebar
- Markdown and code formatting
- Separate conversation context for each chat

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Axios, CSS Modules, Lucide React |
| Backend | Node.js, Express, Google Gemini API |
| Database | MySQL |
| Hosting | Vercel, Render, Aiven |

## Project Structure

```text
backend/
  db/
  src/
  index.js
frontend/
  src/
    components/
DEPLOYMENT.md
```

## Local Setup

### Requirements

- Node.js 22.12+ within the 22.x release line
- MySQL database
- Google Gemini API key

### Backend

```sh
cd backend
npm ci
```

Copy `.env.example` to `.env` and configure:

```dotenv
PORT=3777
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

DB_SSL=false
DB_SSL_CA_PATH=

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_model_name
```

Create the database first, then initialize its tables:

```sh
npm run db:init
```

Start the backend:

```sh
npm start
```

For development with automatic restarts:

```sh
npm run dev
```

### Frontend

Open another terminal:

```sh
cd frontend
npm ci
```

Copy `.env.example` to `.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:3777/api
```

Start the frontend:

```sh
npm run dev
```

Open `http://localhost:5173`.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Aiven MySQL

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete deployment procedure, environment variables, and certificate setup.

## Notes

- Keep `.env` files, API keys, passwords, and database certificates out of Git.
- Database initialization creates tables; it does not transfer existing local messages.
- Authentication is not implemented. Visitors to the same deployment share its chat history.
- This is an independent learning project and is not affiliated with OpenAI.
