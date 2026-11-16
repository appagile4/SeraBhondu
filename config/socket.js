import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

let io = null;
const activeUsers = new Map(); // userId -> Set of socketIds

// Helper to get only live, actively connected sockets for a user
function getActiveUserSockets(userId) {
  if (!userId) return [];
  const uid = userId.toString();
  if (!activeUsers.has(uid)) return [];

  const socketSet = activeUsers.get(uid);
  const liveSockets = [];

  for (const sId of socketSet) {
    const liveSocket = io?.sockets?.sockets?.get(sId);
    if (liveSocket && liveSocket.connected) {
      liveSockets.push(sId);
    } else {
      socketSet.delete(sId);
    }
  }

  if (socketSet.size === 0) {
    activeUsers.delete(uid);
  }

  return liveSockets;
}

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://192.168.1.12:3000",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Helper to verify JWT token and retrieve User
  const authenticateToken = async (token) => {
    if (!token) return null;
    try {
      const cleanToken = token.replace("Bearer ", "").trim();
      const decoded = jwt.verify(
        cleanToken,
        process.env.JWT_SECRET || "khojobangla_classifieds_bangladesh_jwt_secret_token_2026_key"
      );
      const user = await User.findById(decoded.id).select("-password");
      return user;
    } catch {
      return null;
    }
  };

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (!token) {
        return next();
      }

      const user = await authenticateToken(token);
      if (user) {
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
      }
      next();
    } catch {
      next();
    }
  });

  io.on("connection", (socket) => {
    // If authenticated during handshake, register presence
    if (socket.userId) {
      registerUserPresence(socket.userId, socket.id);
      socket.join(`user_${socket.userId}`);
      if (socket.userRole === "superadmin") {
        socket.join("superadmin_room");
      }
    }

    // Explicit runtime authentication event (e.g. after client login)
    socket.on("authenticate", async ({ token }) => {
      if (!token) return;
      const user = await authenticateToken(token);
      if (user) {
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
        socket.join(`user_${socket.userId}`);

        if (socket.userRole === "superadmin") {
          socket.join("superadmin_room");
        }

        registerUserPresence(socket.userId, socket.id);

        socket.emit("authenticated", {
          userId: socket.userId,
          userName: socket.userName,
          userRole: socket.userRole,
        });
      } else {
        socket.emit("auth:error", { message: "Invalid authentication token." });
      }
    });

    // Check user online status and last seen
    socket.on("user:check_online", async ({ userId }, callback) => {
      const uid = userId ? userId.toString() : "";
      const rawSet = activeUsers.get(uid);
      const liveSockets = getActiveUserSockets(uid);
      console.log(`[user:check_online] userId: ${uid}, rawSet: ${Array.from(rawSet || [])}, liveSockets: ${liveSockets}`);
      const isOnline = liveSockets.length > 0;
      let lastSeen = null;
      if (!isOnline && uid) {
        const u = await User.findById(uid).select("lastSeen");
        lastSeen = u?.lastSeen;
      }

      const response = { userId: uid, isOnline, lastSeen };
      if (typeof callback === "function") {
        callback(response);
      } else {
        socket.emit("user:status_response", response);
      }
    });

    // Subscribe to presence of specific user(s)
    socket.on("presence:subscribe", async ({ userIds = [] }) => {
      for (const targetId of userIds) {
        const uid = targetId ? targetId.toString() : "";
        const isOnline = getActiveUserSockets(uid).length > 0;
        let lastSeen = null;
        if (!isOnline && uid) {
          const u = await User.findById(uid).select("lastSeen");
          lastSeen = u?.lastSeen;
        }
        socket.emit("user:online_status", {
          userId: uid,
          isOnline,
          lastSeen,
        });
      }
    });

    // Join a specific conversation room
    socket.on("chat:join", async ({ conversationId, token }) => {
      if (!conversationId) return;

      try {
        if (!socket.userId && token) {
          const user = await authenticateToken(token);
          if (user) {
            socket.userId = user._id.toString();
            socket.userName = user.name;
            socket.userRole = user.role;
            socket.join(`user_${socket.userId}`);
            registerUserPresence(socket.userId, socket.id);
          }
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Verify participant authorization
        if (socket.userId) {
          const isParticipant = conversation.participants.some(
            (p) => p.toString() === socket.userId
          );
          if (!isParticipant && socket.userRole !== "superadmin") {
            return socket.emit("chat:error", {
              message: "Unauthorized to join this conversation.",
            });
          }
        }

        socket.join(`conversation_${conversationId}`);
        socket.emit("chat:joined", { conversationId });
      } catch {
        socket.emit("chat:error", { message: "Failed to join chat room." });
      }
    });

    // Leave a conversation room
    socket.on("chat:leave", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Send a real-time message
    socket.on("message:send", async (data, ackCallback) => {
      try {
        const {
          conversationId,
          text,
          message: rawMessage,
          messageType = "text",
          attachments = [],
          replyTo,
          clientMessageId,
          token,
        } = data;

        const content = (text || rawMessage || "").trim();

        if (!conversationId || (!content && attachments.length === 0)) {
          return socket.emit("chat:error", { message: "Message cannot be empty." });
        }

        // Late token authentication fallback
        if (!socket.userId && token) {
          const user = await authenticateToken(token);
          if (user) {
            socket.userId = user._id.toString();
            socket.userName = user.name;
            socket.userRole = user.role;
            socket.join(`user_${socket.userId}`);
            registerUserPresence(socket.userId, socket.id);
          }
        }

        if (!socket.userId) {
          return socket.emit("chat:error", {
            message: "Authentication required to send messages.",
          });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit("chat:error", { message: "Conversation not found." });
        }

        // Verify membership
        const isParticipant = conversation.participants.some(
          (p) => p.toString() === socket.userId
        );
        if (!isParticipant && socket.userRole !== "superadmin") {
          return socket.emit("chat:error", {
            message: "Unauthorized to send messages in this conversation.",
          });
        }

        // Determine recipient
        const receiverId = conversation.participants.find(
          (p) => p.toString() !== socket.userId
        );

        if (!receiverId) {
          return socket.emit("chat:error", { message: "Recipient not found." });
        }

        // Idempotency check: if clientMessageId already exists, reuse it
        if (clientMessageId) {
          const existing = await Message.findOne({ clientMessageId });
          if (existing) {
            const populatedExisting = await Message.findById(existing._id)
              .populate("sender", "name avatar")
              .populate("receiver", "name avatar")
              .populate({
                path: "replyTo",
                select: "text message sender createdAt",
                populate: { path: "sender", select: "name" },
              });
            const payload = formatMessagePayload(populatedExisting, socket.userId);
            if (typeof ackCallback === "function") ackCallback({ success: true, message: payload });
            return socket.emit("message:sent", payload);
          }
        }

        // Check if recipient is currently online to set initial status
        const isReceiverOnline = getActiveUserSockets(receiverId).length > 0;

        const initialStatus = isReceiverOnline ? "delivered" : "sent";
        const deliveredAt = isReceiverOnline ? new Date() : null;

        // 1. Create message in MongoDB
        const newMessage = await Message.create({
          conversation: conversation._id,
          sender: socket.userId,
          receiver: receiverId,
          message: content || (attachments.length > 0 ? "Photo" : ""),
          text: content || (attachments.length > 0 ? "Photo" : ""),
          messageType: attachments.length > 0 ? "image" : messageType,
          attachments,
          replyTo: replyTo || undefined,
          clientMessageId,
          status: initialStatus,
          deliveredAt,
        });

        // 2. Update conversation
        conversation.lastMessage = newMessage._id;
        conversation.lastMessageText = content || (attachments.length > 0 ? "Photo" : "");
        conversation.lastMessageSender = socket.userId;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id)
          .populate("sender", "name avatar")
          .populate("receiver", "name avatar")
          .populate({
            path: "replyTo",
            select: "text message sender createdAt",
            populate: { path: "sender", select: "name" },
          });

        const normalizedPayload = formatMessagePayload(populatedMessage, socket.userId);

        // Acknowledge sender
        socket.emit("message:sent", normalizedPayload);
        if (typeof ackCallback === "function") {
          ackCallback({ success: true, message: normalizedPayload });
        }

        // 3. Broadcast to all users in the conversation room
        io.to(`conversation_${conversationId}`).emit("message:new", normalizedPayload);

        // 4. Send direct real-time alert to recipient
        io.to(`user_${receiverId}`).emit("chat:new_message_alert", {
          conversationId,
          message: normalizedPayload,
          senderName: socket.userName || populatedMessage.sender?.name,
        });

        // If delivered immediately, notify sender room
        if (isReceiverOnline) {
          io.to(`conversation_${conversationId}`).emit("message:delivered", {
            messageId: newMessage._id,
            conversationId,
            deliveredAt,
          });
        }
      } catch (err) {
        console.error("Socket Message Error:", err);
        socket.emit("chat:error", { message: "Failed to deliver message." });
        if (typeof ackCallback === "function") {
          ackCallback({ success: false, message: "Delivery failed" });
        }
      }
    });

    // Recipient acknowledges delivery of a message
    socket.on("message:delivered", async ({ messageId, conversationId }) => {
      if (!messageId) return;
      try {
        const message = await Message.findById(messageId);
        if (message && message.status === "sent") {
          message.status = "delivered";
          message.deliveredAt = new Date();
          await message.save();

          io.to(`conversation_${conversationId || message.conversation}`).emit(
            "message:delivered",
            {
              messageId: message._id,
              conversationId: conversationId || message.conversation,
              deliveredAt: message.deliveredAt,
            }
          );
        }
      } catch (err) {
        console.error("message:delivered error:", err);
      }
    });

    // Mark messages as read in conversation (Double Blue Ticks)
    socket.on("chat:read", async ({ conversationId, token }) => {
      if (!conversationId) return;
      if (!socket.userId && token) {
        const user = await authenticateToken(token);
        if (user) socket.userId = user._id.toString();
      }

      if (!socket.userId) return;

      try {
        const readAt = new Date();
        await Message.updateMany(
          {
            conversation: conversationId,
            receiver: socket.userId,
            status: { $in: ["sent", "delivered"] },
          },
          {
            $set: { status: "read", isRead: true, readAt },
          }
        );

        io.to(`conversation_${conversationId}`).emit("messages:read", {
          conversationId,
          readerId: socket.userId,
          readAt,
        });
      } catch (err) {
        console.error("chat:read error:", err);
      }
    });

    // Typing Indicators
    socket.on("typing:start", ({ conversationId }) => {
      if (conversationId && socket.userId) {
        socket.to(`conversation_${conversationId}`).emit("typing:update", {
          conversationId,
          isTyping: true,
          userId: socket.userId,
          userName: socket.userName,
        });
      }
    });

    socket.on("typing:stop", ({ conversationId }) => {
      if (conversationId && socket.userId) {
        socket.to(`conversation_${conversationId}`).emit("typing:update", {
          conversationId,
          isTyping: false,
          userId: socket.userId,
        });
      }
    });

    // Disconnect
    socket.on("disconnect", async (reason) => {
      console.log(`[Socket Disconnect] socket: ${socket.id}, user: ${socket.userId}, reason: ${reason}`);
      if (socket.userId) {
        const uid = socket.userId.toString();
        if (activeUsers.has(uid)) {
          const userSockets = activeUsers.get(uid);
          userSockets.delete(socket.id);
          console.log(`[Socket Disconnect] user ${uid} remaining sockets:`, userSockets.size);

          if (userSockets.size === 0) {
            activeUsers.delete(uid);
            const now = new Date();

            try {
              await User.findByIdAndUpdate(uid, { lastSeen: now });
            } catch {}

            io.emit("user:online_status", {
              userId: uid,
              isOnline: false,
              lastSeen: now,
            });
          }
        }
      }
    });
  });

  return io;
};

// Presence helper
function registerUserPresence(userId, socketId) {
  if (!userId) return;
  const uid = userId.toString();
  if (!activeUsers.has(uid)) {
    activeUsers.set(uid, new Set());
  }
  activeUsers.get(uid).add(socketId);

  io?.emit("user:online_status", {
    userId: uid,
    isOnline: true,
    lastSeen: null,
  });
}

// Formatter helper
function formatMessagePayload(msg, currentUserId) {
  const senderId = msg.sender?._id || msg.sender;
  const isMe = currentUserId ? senderId.toString() === currentUserId.toString() : false;

  return {
    _id: msg._id,
    id: msg._id.toString(),
    conversation: msg.conversation,
    sender: msg.sender,
    senderId,
    senderName: msg.sender?.name || "User",
    senderAvatar: msg.sender?.avatar,
    receiver: msg.receiver,
    message: msg.message || msg.text || "",
    text: msg.text || msg.message || "",
    messageType: msg.messageType || "text",
    attachments: msg.attachments || [],
    status: msg.status || (msg.isRead ? "read" : "sent"),
    isRead: msg.isRead || msg.status === "read",
    deliveredAt: msg.deliveredAt,
    readAt: msg.readAt,
    replyTo: msg.replyTo,
    clientMessageId: msg.clientMessageId,
    isDeleted: msg.isDeleted || false,
    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    isMe,
  };
}

export const getIO = () => {
  return io;
};