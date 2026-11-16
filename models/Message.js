import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
        fileName: { type: String, default: "attachment" },
        mimeType: { type: String, default: "image/jpeg" },
        size: { type: Number, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    clientMessageId: {
      type: String,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save synchronization hook
messageSchema.pre("save", function (next) {
  // Sync text and message fields
  if (!this.text && this.message) {
    this.text = this.message;
  } else if (!this.message && this.text) {
    this.message = this.text;
  }

  // Sync isRead and status
  if (this.status === "read") {
    this.isRead = true;
    if (!this.readAt) this.readAt = new Date();
  } else {
    this.isRead = false;
  }

  next();
});

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, status: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;