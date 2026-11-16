export interface MessageAttachment {
  url: string;
  publicId?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export interface ReplyPreview {
  _id: string;
  text?: string;
  message?: string;
  sender?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  _id?: string;
  conversation?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId?: string;
  text: string;
  message?: string;
  timestamp: string;
  isMe: boolean;
  status: "sent" | "delivered" | "read";
  isRead?: boolean;
  deliveredAt?: string;
  readAt?: string;
  replyTo?: ReplyPreview;
  attachments?: MessageAttachment[];
  messageType?: "text" | "image" | "file" | "system";
  clientMessageId?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatConversation {
  id: string;
  _id?: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  productSlug?: string;
  productLocation?: string;
  buyerId?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerPhone?: string;
  sellerVerified?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages?: ChatMessage[];
  isArchived?: boolean;
  isOnline?: boolean;
  lastSeen?: string | null;
  updatedAt?: string;
}