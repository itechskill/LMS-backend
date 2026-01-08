import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "./config/db.js";
import http from "http";
import { Server } from "socket.io";

// ====== Routes ======
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import adminExamResultsRoutes from "./routes/adminExamResults.js";

import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

// Fixing __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Middleware ======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== Connect MongoDB ======
connectToDatabase();

// ====== API Routes ======
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminExamResultsRoutes);
// ====== Test Route ======
app.get("/", (req, res) => {
  res.send("LMS Backend Server Running Successfully! 🚀");
});

// ====== Error Handler ======
app.use(errorHandler);

// ====== Create HTTP server & Socket.IO ======
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// ====== Real-time Chat ======
const onlineUsers = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // ✅ User joins with their ID
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
    console.log("📋 Online users:", Object.keys(onlineUsers));
  });

  // ✅ Sending message
  socket.on("send_message", (data) => {
    console.log("📨 Received send_message event:", data);
    
    const { senderId, receiverId, text, _id, createdAt } = data;

    if (!senderId || !receiverId || !text) {
      console.error("❌ Invalid message data:", data);
      return;
    }

    // Create message object
    const message = {
      _id: _id || Date.now().toString(),
      sender: senderId,
      receiver: receiverId,
      text,
      createdAt: createdAt || new Date().toISOString()
    };

    console.log("📤 Broadcasting message:", message);

    // ✅ Send to receiver if online
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      console.log(`✅ Sending to receiver ${receiverId} at socket ${receiverSocket}`);
      io.to(receiverSocket).emit("receive_message", message);
    } else {
      console.log(`⚠️ Receiver ${receiverId} is offline`);
    }

    // ✅ Send back to sender for confirmation (different socket)
    const senderSocket = onlineUsers[senderId];
    if (senderSocket && senderSocket !== socket.id) {
      console.log(`✅ Sending confirmation to sender ${senderId} at socket ${senderSocket}`);
      io.to(senderSocket).emit("receive_message", message);
    }
  });

  socket.on("disconnect", () => {
    // Remove user from online list
    let disconnectedUser = null;
    for (const [userId, sockId] of Object.entries(onlineUsers)) {
      if (sockId === socket.id) {
        disconnectedUser = userId;
        delete onlineUsers[userId];
        break;
      }
    }
    console.log(`❌ User ${disconnectedUser || socket.id} disconnected`);
    console.log("📋 Online users:", Object.keys(onlineUsers));
  });

  // ✅ Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// ====== Start server ======
server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
  console.log(`🌐 Socket.IO server ready`);
});