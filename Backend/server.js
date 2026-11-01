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

// Middleware
app.use(cors());
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
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

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
    console.log(`User connected: ${socket.user.id}`);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.id}`);
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

