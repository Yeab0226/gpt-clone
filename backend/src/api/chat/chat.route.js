import express from "express";
import { createConversationController, getConversationsController,
  getChatsController, createChatController, deleteChatController,
} from "./controller/chat.controller.js";

const chatRouter = express.Router();
chatRouter.get("/chats", getChatsController);
chatRouter.post("/chats", createChatController);
chatRouter.delete("/chats/:chatId", deleteChatController);
chatRouter.post("/conversations", createConversationController);
chatRouter.get("/conversations", getConversationsController);
export default chatRouter;
