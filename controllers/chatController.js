import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Advertisement from "../models/Advertisement.js";
import User from "../models/User.js";
import { getIO } from "../config/socket.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

/**
 * @desc    Get or create conversation between buyer, seller, and advertisement
 * @route   POST /api/chat/conversations
 * @access  Private
 */
export const getOrCreateConversation = async (req, res) => {
  try {
    const { advertisementId, sellerId } = req.body;

    if (!advertisementId) {
      return res.status(400).json({
        success: false,
        message: "Advertisement ID is required to initiate a conversation.",
      });
    }

    const ad = await Advertisement.findById(advertisementId);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    const actualSellerId = sellerId || ad.seller;

    // Seller cannot chat with themselves
    if (req.user._id.toString() === actualSellerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation on your own advertisement.",
      });
    }

    // Check if conversation already exists for this ad and these two participants
    let conversation = await Conversation.findOne({
      advertisement: advertisementId,
      participants: { $all: [req.user._id, actualSellerId] },
    })
      .populate("participants", "name avatar isVerified city phone lastSeen")
      .populate("advertisement", "title slug price images location status seller");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, actualSellerId],
        buyer: req.user._id,
        seller: actualSellerId,
        advertisement: advertisementId,
        lastMessageText: "Conversation started",
        lastMessageSender: req.user._id,
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name avatar isVerified city phone lastSeen")
        .populate("advertisement", "title slug price images location status seller");
    }

    // Fetch initial message history
    const rawMessages = await Message.find({
      conversation: conversation._id,
      deletedFor: { $ne: req.user._id },
    })
      .sort({ createdAt: 1 })
      .limit(50)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .populate({
        path: "replyTo",
        select: "text message sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    const messages = rawMessages.map((m) => normalizeMessage(m, req.user._id));

    res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error("Get/Create Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate conversation.",
    });
  }
};

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getUserConversations = async (req, res) => {
  try {
    const rawConversations = await Conversation.find({
      participants: req.user._id,
      archivedBy: { $ne: req.user._id },
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name avatar isVerified city phone lastSeen")
      .populate("advertisement", "title slug price images location status seller")
      .lean();

    // Attach unread counts and resolve latest message preview safely
    const conversations = await Promise.all(
      rawConversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: req.user._id,
          status: { $in: ["sent", "delivered"] },
          isDeleted: false,
        });

        let lastMsg = conv.lastMessageText;
        if (!lastMsg) {
          if (typeof conv.lastMessage === "string" && conv.lastMessage.length > 0) {
            lastMsg = conv.lastMessage;
          } else {
            const latest = await Message.findOne({ conversation: conv._id })
              .sort({ createdAt: -1 })
              .select("text message");
            lastMsg = latest ? (latest.text || latest.message) : "Conversation started";
          }
        }

        return {
          ...conv,
          lastMessage: lastMsg,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("Get User Conversations Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations.",
    });
  }
};

/**
 * @desc    Get single conversation by ID
 * @route   GET /api/chat/conversations/:id
 * @access  Private
 */
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("participants", "name avatar isVerified city phone lastSeen")
      .populate("advertisement", "title slug price images location status seller");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const isMember = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation.",
    });
  }
};

/**
 * @desc    Get message history with pagination (cursor or page)
 * @route   GET /api/chat/conversations/:id/messages
 * @access  Private
 */
export const getConversationMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access messages in this conversation.",
      });
    }

    const limit = parseInt(req.query.limit, 10) || 50;
    const before = req.query.before; // Cursor: fetch messages created before this timestamp or ID

    const query = {
      conversation: req.params.id,
      deletedFor: { $ne: req.user._id },
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const rawMessages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .populate({
        path: "replyTo",
        select: "text message sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    // Mark unread messages sent to me as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        receiver: req.user._id,
        status: { $in: ["sent", "delivered"] },
      },
      {
        $set: { status: "read", isRead: true, readAt: new Date() },
      }
    );

    // Notify room via Socket.IO
    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${req.params.id}`).emit("messages:read", {
          conversationId: req.params.id,
          readerId: req.user._id.toString(),
          readAt: new Date(),
        });
      }
    } catch {}

    // Sort back to chronological order (oldest to newest)
    const reversed = rawMessages.reverse();
    const messages = reversed.map((m) => normalizeMessage(m, req.user._id));

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
      hasMore: rawMessages.length === limit,
    });
  } catch (error) {
    console.error("Get Conversation Messages Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load messages.",
    });
  }
};

/**
 * @desc    Send message (REST API endpoint / fallback)
 * @route   POST /api/chat/conversations/:id/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const {
      text,
      message: rawMessage,
      messageType = "text",
      attachments = [],
      replyTo,
      clientMessageId,
    } = req.body;

    const content = (text || rawMessage || "").trim();

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    // Prevent duplicate submission with same clientMessageId
    if (clientMessageId) {
      const existing = await Message.findOne({ clientMessageId });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: normalizeMessage(existing, req.user._id),
        });
      }
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      message: content || (attachments.length > 0 ? "Photo" : ""),
      text: content || (attachments.length > 0 ? "Photo" : ""),
      messageType: attachments.length > 0 ? "image" : messageType,
      attachments,
      replyTo: replyTo || undefined,
      clientMessageId,
      status: "sent",
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageText = content || (attachments.length > 0 ? "Photo" : "");
    conversation.lastMessageSender = req.user._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .populate({
        path: "replyTo",
        select: "text message sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    const normalized = normalizeMessage(populated, req.user._id);

    // Emit Socket events
    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${conversation._id}`).emit("message:new", normalized);
        io.to(`user_${receiverId}`).emit("chat:new_message_alert", {
          conversationId: conversation._id,
          message: normalized,
          senderName: req.user.name,
        });
      }
    } catch {}

    res.status(201).json({
      success: true,
      message: normalized,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message.",
    });
  }
};

/**
 * @desc    Mark conversation messages as read
 * @route   PATCH /api/chat/conversations/:id/read OR PUT /api/chat/conversations/:id/read
 * @access  Private
 */
export const markConversationRead = async (req, res) => {
  try {
    const updated = await Message.updateMany(
      {
        conversation: req.params.id,
        receiver: req.user._id,
        status: { $in: ["sent", "delivered"] },
      },
      {
        $set: { status: "read", isRead: true, readAt: new Date() },
      }
    );

    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${req.params.id}`).emit("messages:read", {
          conversationId: req.params.id,
          readerId: req.user._id.toString(),
          readAt: new Date(),
        });
      }
    } catch {}

    res.status(200).json({
      success: true,
      message: "Messages marked as read.",
      count: updated.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read.",
    });
  }
};

/**
 * @desc    Mark a single message as read
 * @route   PATCH /api/chat/messages/:id/read
 * @access  Private
 */
export const markSingleMessageRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    message.status = "read";
    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${message.conversation}`).emit("message:read", {
          messageId: message._id,
          conversationId: message.conversation,
          readerId: req.user._id.toString(),
          readAt: message.readAt,
        });
      }
    } catch {}

    res.status(200).json({
      success: true,
      message: normalizeMessage(message, req.user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark message read." });
  }
};

/**
 * @desc    Delete message (Delete for me or Delete for everyone)
 * @route   DELETE /api/chat/messages/:id
 * @access  Private
 */
export const deleteMessage = async (req, res) => {
  try {
    const { deleteForEveryone = false } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const isSender = message.sender.toString() === req.user._id.toString();

    if (deleteForEveryone) {
      if (!isSender) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own messages for everyone.",
        });
      }

      message.isDeleted = true;
      message.text = "This message was deleted";
      message.message = "This message was deleted";
      message.attachments = [];
      await message.save();

      try {
        const io = getIO();
        if (io) {
          io.to(`conversation_${message.conversation}`).emit("message:deleted", {
            messageId: message._id,
            conversationId: message.conversation,
            deleteForEveryone: true,
          });
        }
      } catch {}
    } else {
      // Delete for me
      if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
        await message.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete message." });
  }
};

/**
 * @desc    Archive conversation
 * @route   PATCH /api/chat/conversations/:id/archive
 * @access  Private
 */
export const archiveConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const isMember = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    if (!conversation.archivedBy.includes(req.user._id)) {
      conversation.archivedBy.push(req.user._id);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      message: "Conversation archived.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to archive conversation." });
  }
};

/**
 * @desc    Get user presence (online status and last seen)
 * @route   GET /api/chat/users/:userId/presence
 * @access  Private
 */
export const getUserPresence = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId).select("name lastSeen");
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      userId: targetUser._id,
      name: targetUser.name,
      lastSeen: targetUser.lastSeen,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch presence." });
  }
};

/**
 * @desc    Upload chat attachment to Cloudinary
 * @route   POST /api/chat/attachments/upload
 * @access  Private
 */
export const uploadChatAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    // Validate size (max 10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 10MB limit.",
      });
    }

    // Allowed mimetypes
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "File type not supported. Allowed: JPG, PNG, WEBP, GIF, PDF.",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, "khojobangla_chat_attachments");

    res.status(200).json({
      success: true,
      attachment: {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Attachment upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload attachment.",
    });
  }
};

/**
 * Helper to normalize message payload for client
 */
function normalizeMessage(m, currentUserId) {
  const senderId = m.sender?._id || m.sender;
  const isMe = currentUserId ? senderId.toString() === currentUserId.toString() : false;

  return {
    _id: m._id,
    id: m._id.toString(),
    conversation: m.conversation,
    sender: m.sender,
    senderId,
    senderName: m.sender?.name || "User",
    senderAvatar: m.sender?.avatar,
    receiver: m.receiver,
    message: m.message || m.text || "",
    text: m.text || m.message || "",
    messageType: m.messageType || "text",
    attachments: m.attachments || [],
    status: m.status || (m.isRead ? "read" : "sent"),
    isRead: m.isRead || m.status === "read",
    deliveredAt: m.deliveredAt,
    readAt: m.readAt,
    replyTo: m.replyTo,
    clientMessageId: m.clientMessageId,
    isDeleted: m.isDeleted || false,
    timestamp: new Date(m.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    isMe,
  };
}
