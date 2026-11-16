import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    advertisement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertisement",
      required: true,
      index: true,
    },
    dealStatus: {
      type: String,
      enum: ["inquired", "negotiating", "agreed", "sold", "cancelled"],
      default: "inquired",
      index: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageText: {
      type: String,
      default: "",
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedBy: [
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

conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ advertisement: 1, buyer: 1, seller: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;