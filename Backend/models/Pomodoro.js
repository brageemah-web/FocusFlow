
const mongoose = require("mongoose");

const pomodoroSchema = new mongoose.Schema(
    {
        duration: {
            type: Number,
            required: true,
            min: 1
        },
        breakDuration: {
            type: Number,
            default: 5,
            min: 0
        },
        sessionType: {
            type: String,
            enum: ["Focus", "Break"],
            default: "Focus"
        },
        completed: {
            type: Boolean,
            default: false
        }, 
        user: {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        }
    },
    { timestamps: true }
);

const Pomodoro = mongoose.model("Pomodoro", pomodoroSchema);

module.exports = Pomodoro;
