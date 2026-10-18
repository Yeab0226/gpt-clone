import "dotenv/config";

import cors from "cors";

import express from "express";

import db from "./db/db.config.js";

import mainRouter from "./src/api/main.routes.js";
import errorHandler from "./src/middleware/error-handler.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
}));

app.use(express.json()); // Middleware to parse JSON request bodies

app.use("/api", mainRouter);

app.use(errorHandler); // Error handling middleware

async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("Database connection established successfully.");
    connection.release(); // Release the connection back to the pool

    app.listen(3777, () => {
      console.log("Server is listening on port 3777");
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}
startServer();
