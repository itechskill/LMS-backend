import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import { connectToDatabase } from "./config/db.js";

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
import paymentRoutes from "./routes/paymentRoutes.js"; // ✅ NEW

import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

// ====== Fix __dirname (ES Modules) ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== CORS (IMPORTANT – FIXED) ======
app.use(cors({
  origin: [
    // "http://localhost:3000",
    // "http://31.97.47.107",
    "https://itechskill.com",
    // "http://172.26.128.1:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ====== Body Parsers ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== Static Uploads ======
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== MongoDB ======
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
app.use("/api/payments", paymentRoutes); // ✅ NEW
// ====== Test Route ======
app.get("/", (req, res) => {
  res.send("LMS Backend Server Running Successfully! 🚀");
});

// ====== Error Handler ======
app.use(errorHandler);

// ====== HTTP Server + Socket.IO ======
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://31.97.47.107",
      // "http://itechskill.com",
      "https://itechskill.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ====== Real-time Chat ======
const onlineUsers = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("✅ New socket connected:", socket.id);

  // User joins
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`👤 User ${userId} joined`);
    console.log("📋 Online users:", Object.keys(onlineUsers));
  });

  // Send message
  socket.on("send_message", (data) => {
    const { senderId, receiverId, text, _id, createdAt } = data;

    if (!senderId || !receiverId || !text) return;

    const message = {
      _id: _id || Date.now().toString(),
      sender: senderId,
      receiver: receiverId,
      text,
      createdAt: createdAt || new Date().toISOString()
    };

    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_message", message);
    }

    const senderSocket = onlineUsers[senderId];
    if (senderSocket && senderSocket !== socket.id) {
      io.to(senderSocket).emit("receive_message", message);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [userId, sockId] of Object.entries(onlineUsers)) {
      if (sockId === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ====== Start Server ======
server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
  console.log(`🌐 Socket.IO server ready`);
});
