
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

const startServer = async() =>{
    await connectDB();

    // Start server
    app.listen(PORT, () => {
        console.log(`FocusFlow server running on port ${PORT}`);
    });
};

startServer();

