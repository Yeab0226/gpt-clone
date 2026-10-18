import db from "../../../../db/db.config.js";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL;

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const getRecentConversationsRows = async (chatId, Limit = 5) => {
  const normalizedLimit = Number.parseInt(Limit, 10);

  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

  const [rows] = await db.execute(
    `SELECT id, role, content, created_at 
     FROM conversations 
     WHERE chat_id = ?
     ORDER BY id DESC 
     ${Limit === null ? "" : `LIMIT ${safeLimit}`}`,
    [chatId],
  );

  return rows.reverse();
};

const generateAssistantAnswer = async ({ historyRows, question }) => {
  // format history for Gemini API
  const formattedHistory = historyRows.map((row) => ({
    role: row.role === `assistant` ? `model` : `user`,
    parts: [{ text: row.content }],
  }));

  const chat = geminiClient.chats.create({
    model: GEMINI_MODEL,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
    history: formattedHistory,
  });

  const result = await chat.sendMessage({
    message: question,
  });

  console.log("Gemini text:", result.text);
  console.log("Gemini usage:", result.usageMetadata);

  return {
    text: result.text ?? "",
    totalTokens: result.usageMetadata?.totalTokenCount ?? 0,
  };
};

const getMessageById = async (messageId) => {
  const [rows] = await db.execute(
    `SELECT id, role, content, token_count, created_at 
     FROM conversations 
     WHERE id = ? 
     LIMIT 1`,
    [messageId],
  );

  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: Number(rows[0].token_count) || 0,
    createdAt: rows[0].created_at,
  };
};

async function createConversationService(question, chatId) {
  // Validation
  if (!question || typeof question !== "string" || question.trim() === "") {
    const error = new Error("Invalid question provided");
    error.status = 400;
    throw error;
  }

  // Get recent conversations from database
  await getChatById(chatId);
  const historyRows = await getRecentConversationsRows(chatId, 6);
  const { text, totalTokens } = await generateAssistantAnswer({ historyRows, question });

  // Save both messages together so a failed request cannot leave half a reply.
  const connection = await db.getConnection();
  let userMessageId;
  let assistantMessageId;
  try {
    await connection.beginTransaction();
    const [userResult] = await connection.execute(
      "INSERT INTO conversations (chat_id, role, content) VALUES (?, ?, ?)",
      [chatId, "user", question],
    );
    const [assistantResult] = await connection.execute(
      "INSERT INTO conversations (chat_id, role, content, token_count) VALUES (?, ?, ?, ?)",
      [chatId, "assistant", text, totalTokens],
    );
    await connection.execute("UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [chatId]);
    await connection.commit();
    userMessageId = userResult.insertId;
    assistantMessageId = assistantResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  // Get saved messages
  const userConversation = await getMessageById(userMessageId);

  const assistantConversation = await getMessageById(
    assistantMessageId,
  );

  return {
    userConversation,
    assistantConversation,
  };
}

async function getChatById(chatId) {
  if (!/^\d+$/.test(String(chatId)) || Number(chatId) <= 0) {
    const error = new Error("Invalid chat ID");
    error.status = 400;
    throw error;
  }
  const [rows] = await db.execute("SELECT * FROM chats WHERE id = ?", [chatId]);
  if (!rows[0]) {
    const error = new Error("Chat not found");
    error.status = 404;
    throw error;
  }
  return rows[0];
}

async function getChatsService() {
  const [rows] = await db.execute("SELECT * FROM chats ORDER BY updated_at DESC, id DESC");
  return rows;
}

async function createChatService(title) {
  const safeTitle = typeof title === "string" && title.trim() ? title.trim().slice(0, 80) : "New chat";
  const [result] = await db.execute("INSERT INTO chats (title) VALUES (?)", [safeTitle]);
  return getChatById(result.insertId);
}

async function deleteChatService(chatId) {
  await getChatById(chatId);
  await db.execute("DELETE FROM chats WHERE id = ?", [chatId]);
}

export { createConversationService, getRecentConversationsRows, getChatById,
  getChatsService, createChatService, deleteChatService };
