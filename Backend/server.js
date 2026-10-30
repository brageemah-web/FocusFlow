
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/tasks", taskRoutes);

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

