import { io } from "socket.io-client";

const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Login failed for ${email}: ${data.message}`);
  }
  return { token: data.token, user: data.user };
}

async function runRealtimeChatTest() {
  console.log("=== Testing KhojoBangla Real-time Socket.IO Chat System ===");

  // 1. Log in Buyer (Aarav) and Seller (Pooja)
  console.log("\n1. Logging in buyer (Aarav) and seller (Pooja)...");
  const buyer = await loginUser("aarav.shrestha@khojobangla.com", "UserPassword123!");
  const seller = await loginUser("pooja.adhikari@khojobangla.com", "UserPassword123!");
  console.log(`Buyer logged in: ${buyer.user.name} (${buyer.user._id})`);
  console.log(`Seller logged in: ${seller.user.name} (${seller.user._id})`);

  // 2. Fetch an approved advertisement owned by Pooja
  console.log("\n2. Fetching seller's advertisement...");
  const adsRes = await fetch(`${API_URL}/advertisements?limit=20`);
  const adsData = await adsRes.json();
  const sellerAd = adsData.advertisements?.find(
    (ad) => String(ad.seller?._id || ad.seller) === String(seller.user._id)
  );

  if (!sellerAd) {
    throw new Error("No approved advertisement found for seller Pooja Adhikari");
  }
  console.log(`Found ad: "${sellerAd.title}" (ID: ${sellerAd._id}, Rs. ${sellerAd.price})`);

  // 3. Buyer initiates conversation with seller on this ad
  console.log("\n3. Buyer initiating conversation via REST API...");
  const convRes = await fetch(`${API_URL}/chat/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${buyer.token}`,
    },
    body: JSON.stringify({
      advertisementId: sellerAd._id,
      sellerId: seller.user._id,
    }),
  });
  const convData = await convRes.json();
  if (!convData.success) {
    throw new Error(`Failed to create conversation: ${convData.message}`);
  }
  const conversation = convData.conversation;
  const conversationId = conversation._id;
  console.log(`Conversation established: ID ${conversationId}`);

  // 4. Connect Buyer and Seller to Socket.IO Server
  console.log("\n4. Connecting both users to Socket.IO server...");
  const buyerSocket = io(SOCKET_URL, {
    auth: { token: buyer.token },
    transports: ["websocket"],
  });

  const sellerSocket = io(SOCKET_URL, {
    auth: { token: seller.token },
    transports: ["websocket"],
  });

  await Promise.all([
    new Promise((resolve) => buyerSocket.on("connect", resolve)),
    new Promise((resolve) => sellerSocket.on("connect", resolve)),
  ]);
  console.log(`Buyer socket connected: ${buyerSocket.id}`);
  console.log(`Seller socket connected: ${sellerSocket.id}`);

  // 5. Join conversation room
  console.log("\n5. Joining conversation room...");
  buyerSocket.emit("chat:join", { conversationId, token: buyer.token });
  sellerSocket.emit("chat:join", { conversationId, token: seller.token });

  await new Promise((r) => setTimeout(r, 600));

  // 6. Test Real-time message from Buyer -> Seller
  console.log("\n6. Testing Buyer sending real-time message...");
  const buyerMessagePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Seller did not receive buyer message in time")), 5000);
    sellerSocket.on("message:new", (msg) => {
      clearTimeout(timeout);
      console.log(`Seller received Socket.IO event 'message:new': "${msg.message}" from ${msg.sender?.name}`);
      resolve(msg);
    });
  });

  buyerSocket.emit("message:send", {
    conversationId,
    text: "Namaste Pooja ji! Is this item still available? Can we negotiate on the price?",
    token: buyer.token,
  });

  const receivedBySeller = await buyerMessagePromise;
  if (!receivedBySeller.text && !receivedBySeller.message) {
    throw new Error("Message text payload is empty!");
  }

  // 7. Test Read Receipts (double blue ticks)
  console.log("\n7. Testing Seller marking message as read...");
  const readPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Buyer did not receive read receipt in time")), 5000);
    buyerSocket.on("messages:read", (data) => {
      clearTimeout(timeout);
      console.log(`Buyer received Socket.IO event 'messages:read' for conversation: ${data.conversationId}`);
      resolve(data);
    });
  });

  sellerSocket.emit("chat:read", { conversationId, token: seller.token });
  await readPromise;

  // 8. Test Typing Indicator
  console.log("\n8. Testing Seller typing indicator...");
  const typingPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Buyer did not receive typing update")), 5000);
    buyerSocket.on("typing:update", (data) => {
      clearTimeout(timeout);
      console.log(`Buyer received 'typing:update': isTyping=${data.isTyping}, userName=${data.userName}`);
      resolve(data);
    });
  });

  sellerSocket.emit("typing:start", { conversationId });
  await typingPromise;

  // 9. Test Seller Reply -> Buyer
  console.log("\n9. Testing Seller sending real-time reply...");
  const sellerMessagePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Buyer did not receive seller reply in time")), 5000);
    buyerSocket.on("message:new", (msg) => {
      clearTimeout(timeout);
      console.log(`Buyer received Socket.IO event 'message:new': "${msg.message}" from ${msg.sender?.name}`);
      resolve(msg);
    });
  });

  sellerSocket.emit("message:send", {
    conversationId,
    text: "Namaste Aarav ji! Yes, it is in pristine condition. I can do a slight discount if picked up today in Pokhara.",
    token: seller.token,
  });

  await sellerMessagePromise;

  // 10. Verify message persistence in MongoDB
  console.log("\n10. Verifying MongoDB persistence via REST API...");
  const historyRes = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${buyer.token}` },
  });
  const historyData = await historyRes.json();
  console.log(`MongoDB message count for conversation: ${historyData.count}`);
  console.log("Last two messages stored in MongoDB:");
  historyData.messages.slice(-2).forEach((m, idx) => {
    console.log(`  [${idx + 1}] ${m.sender?.name}: "${m.message}" (Read: ${m.isRead})`);
  });

  // Cleanup
  buyerSocket.disconnect();
  sellerSocket.disconnect();
  console.log("\nSUCCESS: All Socket.IO real-time chat tests passed flawlessly!");
}

runRealtimeChatTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
