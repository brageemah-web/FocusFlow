
const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ["Assignment", "Exam", "Reminder", "Other"],
            default: "Other"
        },
        completed: {
            type: Boolean,
            default: false
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);

module.exports = CalendarEvent;
