const express = require("express");
const router = express.Router();

const CalendarEvent = require("../models/CalendarEvent");
const protect = require("../middleware/authMiddleware");

// Get (retrieve all calendar event)
router.get("/", protect, async(req,res) =>{
    try{
        const events = await CalendarEvent.find({user: req.user.id}).sort({date : 1});

        //200 OK
        res.status(200).json(events);
    }
    catch(e){
        // 500 Internal Server Error
        res.status(500).json({
            message : "Failed to retrieve calendar events",
            error : e.message
        });
    }
});

// Post (create a new calendar event)
router.post("/", protect, async(req,res) => {
    try{
        const {title, description, date, type} = req.body;

        if(!title || !date){
            //400 Bad Request
            return res.status(400).json({
                message : "Title and date are required"
            });
        }

        const newEvent = new CalendarEvent({
            title,
            description,
            date,
            type,
            user: req.user.id
        });

        const savedEvent = await newEvent.save();

        //201 Created
        res.status(201).json(savedEvent);
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message : "Failed to create calendar event",
            error : e.message
        });
    }
});

//Put (update a calendar event)
router.put("/:id", protect, async (req, res) => {
    try {
        const { title, description, date, type, completed } = req.body;

        const updatedEvent = await CalendarEvent.findOneAndUpdate(
            {_id: req.params.id, user: req.user.id},
            {title, description, date, type, completed},
            {new: true, runValidators: true}
        );

        if (!updatedEvent) {
            return res.status(404).json({
                message: "Calendar event not found"
            });
        }

        res.status(200).json(updatedEvent);
    } catch (e) {
        res.status(500).json({
            message: "Failed to update calendar event",
            error: e.message
        });
    }
});

// Delete (delete a calendar event)
router.delete("/:id", protect, async (req, res) => {
    try {
        const deletedEvent = await CalendarEvent.findOneAndDelete({_id: req.params.id, user: req.user.id});

        if (!deletedEvent) {
            return res.status(404).json({
                message: "Calendar event not found"
            });
        }

        res.status(200).json({
            message: "Calendar event deleted successfully"
        });
    } catch (e) {
        res.status(500).json({
            message: "Failed to delete calendar event",
            error: e.message
        });
    }
});

module.exports = router;
