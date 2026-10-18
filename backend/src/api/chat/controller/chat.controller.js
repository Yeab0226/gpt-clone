import {
  createConversationService, getRecentConversationsRows, getChatById,
  getChatsService, createChatService, deleteChatService,
} from "../service/chat.service.js";

async function createConversationController(req, res) {
  const result = await createConversationService(req.body.question, req.body.chatId);
  res.status(201).json({ success: true, data: result });
}

async function getConversationsController(req, res) {
  await getChatById(req.query.chatId);
  const conversations = await getRecentConversationsRows(req.query.chatId, null);
  res.json({ success: true, data: { conversations } });
}

async function getChatsController(req, res) {
  const chats = await getChatsService();
  res.json({ success: true, data: { chats } });
}

async function createChatController(req, res) {
  const chat = await createChatService(req.body.title);
  res.status(201).json({ success: true, data: { chat } });
}

async function deleteChatController(req, res) {
  await deleteChatService(req.params.chatId);
  res.json({ success: true, message: "Chat deleted successfully" });
}

export { createConversationController, getConversationsController,
  getChatsController, createChatController, deleteChatController };
