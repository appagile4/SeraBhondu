import express from "express";
import multer from "multer";
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  sendMessage,
  markConversationRead,
  markSingleMessageRead,
  deleteMessage,
  archiveConversation,
  getUserPresence,
  uploadChatAttachment,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.use(protect); // All chat endpoints require JWT authentication

// Conversation routes
router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getUserConversations);
router.get("/conversations/:id", getConversationById);
router.patch("/conversations/:id/archive", archiveConversation);

// Message routes
router.get("/conversations/:id/messages", getConversationMessages);
router.post("/conversations/:id/messages", sendMessage);
router.put("/conversations/:id/read", markConversationRead);
router.patch("/conversations/:id/read", markConversationRead);

// Single message actions
router.patch("/messages/:id/read", markSingleMessageRead);
router.delete("/messages/:id", deleteMessage);

// Presence
router.get("/users/:userId/presence", getUserPresence);

// Attachments
router.post("/attachments/upload", upload.single("file"), uploadChatAttachment);

export default router;