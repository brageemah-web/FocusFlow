const express = require("express");
const router = express.Router();

const Task = require("../models/Task");

//GET (get all tasks)
router.get("/",async (req,res)=> {
    try{
        const tasks = await Task.find().sort({createdAt: -1});

        //200 OK
        res.status(200).json(tasks);
    }
    catch(e){
        //500 Internal server error
        res.status(500).json({
            message : "Failed to retrieve tasks",
            error: e.message
        });
    }
});

//POST (creates a task)
router.post("/", async(req,res) => {
    try{
        const {title, description, dueDate} = req.body;
        if(!title || !title.trim()){
            //400 Bad Request
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const newTask = new Task({
            title,
            description,
            dueDate: dueDate || null
        });

        const savedTask = await newTask.save();
        //201 created
        res.status(201).json(savedTask);
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message: "Failed to create task",
            error: e.message
        })
    }
});

// PUT (update an existing task)

router.put("/:id", async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                message: "Request body is missing"
            });
        }

        const { title, description, dueDate, completed } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                dueDate,
                completed
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(updatedTask);

    } catch (error) {
        res.status(400).json({
            message: "Failed to update task",
            error: error.message
        });
    }
});


//Delete (delete a task)
router.delete("/:id", async(req,res) => {
    try{
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if(!deletedTask){
            //404 Not Found
            return req.status(404).json({
                message : "Task not found"
            });
        }
        //200 OK
        res.status(200).json({
            message : "Task deleted successfullly"
        });
    }
    catch(e){
        //400 Bad Request
        res.status(400).json({
            message : "Failed to delete task",
            error : e.message
        })
    }
});

module.exports = router;
