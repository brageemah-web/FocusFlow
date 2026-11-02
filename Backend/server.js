const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const taskRoutes = require("./routes/tasks");
const noteRoutes = require("./routes/notes");
const calendarRoutes = require("./routes/calendar");
const pomodoroRoutes = require("./routes/pomodoro");
const authRoutes = require("./routes/auth");
const friendRoutes = require("./routes/friends");
const conversationRoutes = require("./routes/conversations");
const messageRoutes = require("./routes/messages");

const app = express();
const PORT = process.env.PORT || 5000;

const onlineUsers = new Map();

// Middleware
// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
].filter(Boolean);

// Middleware
app.use(cors({
    origin: allowedOrigins
}));

app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "FocusFlow backend is running!"
    });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
});

app.set("io", io);

// Socket.IO JWT authentication
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.user = {
            id: decoded.id
        };

        next();

    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
});


io.on("connection", (socket) => {
    const userId = socket.user.id;

    console.log(`User connected: ${userId}`);

    // Mark user as online
    onlineUsers.set(userId, socket.id);

    // Send the current online users to the newly connected user
    socket.emit("online_users", Array.from(onlineUsers.keys()));

    io.emit("user_status", {
        userId,
        status: "online"
    });

    // Join a conversation room
    socket.on("join_conversation", async (conversationId) => {
        try {
            const Conversation = require("./models/Conversation");

            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                socket.emit("socket_error", {
                    message: "Conversation not found."
                });
                return;
            }

            const isParticipant = conversation.participants.some(
                (participant) => participant.toString() === socket.user.id
            );

            if (!isParticipant) {
                socket.emit("socket_error", {
                    message: "You are not a participant in this conversation."
                });
                return;
            }

            socket.join(conversationId);

            console.log(
                `User ${userId} joined conversation ${conversationId}`
            );

        } catch (error) {
            console.error("Error joining conversation:", error.message);

            socket.emit("socket_error", {
                message: "Could not join conversation."
            });
        }
    });

    socket.on("leave_conversation", (conversationId) => {
        socket.leave(conversationId);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        if (onlineUsers.get(userId) === socket.id) {
            onlineUsers.delete(userId);

            io.emit("user_status", {
                userId,
                status: "offline"
            });
        }

        console.log(`User disconnected: ${userId}`);
    });
});

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (e) {
        console.error("Failed to start server:", e.message);
        process.exit(1);
    }
};

startServer();

