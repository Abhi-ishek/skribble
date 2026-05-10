import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { CLIENT_URL } from "./config/env.js";
import { connectDB } from "./db/connect.js";
import { seedWords } from "./utils/wordSeeder.js";
import { GameManager } from "./classes/GameManager.js";
import socketHandler from "./sockets/socketHandler.js";
import roomRoutes from "./routes/roomRoutes.js";


// 1. Initialize Express and HTTP Server
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;


// 2. Setup Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// 3. Setup Express Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/', (req,res) =>{
  res.send("backend is running")})
// 4. REST API Routes
app.use("/api", roomRoutes);

// 5. Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 6. Connect to Database & Seed
const startServer = async () => {
  try {
    await connectDB();
    await seedWords();

    // 7. Initialize Game Manager & Sockets
    const gameManager = new GameManager(io);
    socketHandler(io, gameManager); 


    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Client URL: ${CLIENT_URL}`);
    });
   
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

 // 8. Start Listening

startServer();
