import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import advertisementRoutes from "./routes/advertisementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";

dotenv.config();

// Connect to MongoDB Atlas & ensure admin existence
connectDB();
const app = express();
const httpServer = http.createServer(app);

// Initialize Real-time Socket.IO Server
initSocket(httpServer);

// Allowed origins for CORS (Serabondhu Frontend)
const allowedOrigins = [
  "https://www.serabondhu.net",
  "https://serabondhu.net",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all in development for convenience
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// Root Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "online",
    message:
      "Serabondhu API Backend & Real-time Socket.IO Server running smoothly 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Mount Production API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/banners", bannerRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` 🚀 Serabondhu Backend & Socket.IO running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Advertisements: http://localhost:${PORT}/api/advertisements`);
  console.log(` Admin Portal: http://localhost:${PORT}/api/admin`);
  console.log(` Real-time Chat: Socket.IO initialized`);
  console.log(`=======================================================`);
});
