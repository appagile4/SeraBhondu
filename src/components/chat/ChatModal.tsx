"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { ChatWindow } from "./ChatWindow";
import { useMarketplace } from "@/context/MarketplaceContext";

export function ChatModal() {
  const { isChatModalOpen, closeChat, activeChatProduct } = useMarketplace();

  if (!activeChatProduct) return null;

  return (
    <Modal
      isOpen={isChatModalOpen}
      onClose={closeChat}
      maxWidth="xl"
      hideCloseButton
      noPadding
    >
      <div className="h-[640px] max-h-[88vh] flex flex-col min-h-0">
        <ChatWindow product={activeChatProduct} onClose={closeChat} />
      </div>
    </Modal>
  );
}

