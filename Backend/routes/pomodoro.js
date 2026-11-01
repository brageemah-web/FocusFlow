const express = require("express");
const router = express.Router();

const Pomodoro = require("../models/Pomodoro");

//Get (reetrieve all pomodoro sessions)
router.get("/", async(req, res) => {
    try{
        const sessions = await Pomodoro.find().sort({createdAT : -1});

        //200 OK
        res.status(200).json(sessions);
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message : "Failed to retrieve Pomodoro session",
            error : e.message
        });
    }
});

//Post (create a pomodoro session)
router.post("/", async(req,res) => {
    try{
        const {duration, breakDuration, sessionType, completed} = req.body;

        if(duration === undefined || duration === null){
            //400 Bad Request
            res.status(400).json({
                message : "Session duration is required"
            });
        }

        const newSession  = new Pomodoro({
            duration,
            breakDuration,
            sessionType,
            completed
        });

        const savedSession = await newSession.save();

        //201 Created
        res.status(201).json(savedSession);
    }
    catch(e){
        // 400 Bad Request
        res.status(400).json({
            message : "Failed to create Pomodoro session",
            error : e.message
        });
    }
});

//Put (update a pomodoro session)
router.put("/:id", async(req,res) =>{
    try{
        const {duration, breakDuration, sessionType, completed} = req.body;

        const updatedSession =  await Pomodoro.findByIdAndUpdate(
            req.params.id,
        {duration,breakDuration,sessionType, completed},
        {new: true, runValidators: true}
        );

        if(!updatedSession){
            //404 Not Found
            return res.status(404).json({
                message : "Pomodoro session is not found"
            });
        }

        //200 OK
        res.status(200).json(updatedSession);
    }
    catch(e){
        //400 Internal Server Error
        res.status(400).json({
            message : "Failed to update Pomodoro session",
            error : e.message
        });
    }
});

// Delete (delete a pomodoro session)
router.delete("/:id", async(req,res) =>{
    try{
        const deletedSession = await Pomodoro.findByIdAndDelete(req.params.id);

        if(!deletedSession){
            //404 Not Found
            return res.status(404).json({
                message : "Pomodoro session not found" 
            });
        }

        //200 OK
        res.status(200).json({
            message :" Pomodoro session was deleted successfully"
        });
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message : "Failed to delete Pomdoro",
            error : e.message
        });
    }
});

module.exports = router;
