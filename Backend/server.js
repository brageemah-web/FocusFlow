
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "FocusFlow backend is running!"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`FocusFlow server running on port ${PORT}`);
});
