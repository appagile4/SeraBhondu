"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChatMessage } from "@/types/chat";
import { Check, CheckCheck, Reply, Trash2, FileText, Ban } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  onReply?: (msg: ChatMessage) => void;
  onDelete?: (msg: ChatMessage) => void;
}

export function MessageBubble({ message, onReply, onDelete }: MessageBubbleProps) {
  const isMe = message.isMe;
  const [showOptions, setShowOptions] = useState(false);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  // Determine tick status for outgoing messages
  const renderTicks = () => {
    if (!isMe) return null;

    if (message.status === "read" || message.isRead) {
      return (
        <span title="Read">
          <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] stroke-[2.5]" />
        </span>
      );
    } else if (message.status === "delivered") {
      return (
        <span title="Delivered">
          <CheckCheck className="w-3.5 h-3.5 text-[#8696A0] stroke-[2.5]" />
        </span>
      );
    } else {
      // Sent (single tick)
      return (
        <span title="Sent">
          <Check className="w-3.5 h-3.5 text-[#8696A0] stroke-[2.5]" />
        </span>
      );
    }
  };

  return (
    <>
      <div
        className={`group relative flex w-full ${isMe ? "justify-end" : "justify-start"} my-1 px-2`}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        {/* Quick action floating menu (Reply, Delete) */}
        {showOptions && !message.isDeleted && (
          <div
            className={`absolute top-0 -translate-y-2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md rounded-full px-2 py-1 transition-opacity ${
              isMe ? "right-16" : "left-16"
            }`}
          >
            {onReply && (
              <button
                type="button"
                onClick={() => onReply(message)}
                className="p-1 text-slate-500 hover:text-[#014923] hover:bg-slate-100 rounded-full transition-colors"
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && isMe && (
              <button
                type="button"
                onClick={() => onDelete(message)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div
          className={`relative max-w-[85%] sm:max-w-[72%] md:max-w-[62%] rounded-2xl shadow-[0_1px_0.5px_rgba(11,20,26,0.12)] p-2 sm:px-3 sm:pt-2 sm:pb-1.5 transition-all ${
            isMe
              ? "bg-[#D9FDD3] text-[#111B21] rounded-tr-xs"
              : "bg-white text-[#111B21] rounded-tl-xs border border-slate-100/80"
          }`}
        >
          {/* Quoted / Reply Preview Block */}
          {message.replyTo && (
            <div
              className={`mb-1.5 rounded-lg border-l-4 px-2.5 py-1 text-xs select-none ${
                isMe
                  ? "bg-[#C4EBC0]/70 border-[#00A884] text-[#111B21]"
                  : "bg-slate-100 border-[#014923] text-slate-800"
              }`}
            >
              <span className="font-bold block text-[11px] text-[#00A884]">
                {message.replyTo.sender?.name || "Original Message"}
              </span>
              <p className="line-clamp-2 text-[11.5px] text-slate-600 italic">
                {message.replyTo.text || message.replyTo.message || "Attachment"}
              </p>
            </div>
          )}

          {/* Attached Images or Files */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-1.5 mb-1">
              {message.attachments.map((att, idx) => {
                const isImage = att.mimeType?.startsWith("image/") || att.url.match(/\.(jpg|jpeg|png|webp|gif)/i);
                if (isImage) {
                  return (
                    <div
                      key={idx}
                      onClick={() => setShowImageModal(att.url)}
                      className="relative w-56 sm:w-64 h-48 sm:h-56 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity bg-slate-200 border border-slate-300/60 shadow-2xs"
                    >
                      <Image
                        src={att.url}
                        alt="Photo attachment"
                        fill
                        sizes="(max-width: 640px) 224px, 256px"
                        className="object-cover"
                      />
                    </div>
                  );
                } else {
                  return (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-black/5 hover:bg-black/10 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-[#014923] shrink-0" />
                      <span className="truncate max-w-[180px]">{att.fileName || "Download Document"}</span>
                    </a>
                  );
                }
              })}
            </div>
          )}

          {/* Message Content */}
          {message.isDeleted ? (
            <div className="flex items-center gap-1.5 text-slate-400 italic text-[13px] py-1 select-none">
              <Ban className="w-3.5 h-3.5" />
              <span>This message was deleted</span>
            </div>
          ) : (
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed whitespace-pre-wrap select-text pr-14 pb-1">
              {message.text || message.message}
            </p>
          )}

          {/* Timestamp and Status Ticks */}
          <div className="absolute right-2 bottom-1 flex items-center gap-1 select-none pointer-events-none">
            <span className="text-[10px] text-[#667781] font-normal leading-none">
              {message.timestamp}
            </span>
            {isMe && !message.isDeleted && (
              <span className="inline-flex items-center">{renderTicks()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Full Size Image Lightbox Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowImageModal(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-[80vh] flex items-center justify-center">
            <Image
              src={showImageModal}
              alt="Enlarged photo"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/80 rounded-full px-3 py-1 text-sm font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MessageBubble;
