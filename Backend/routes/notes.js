const express = require("express");
const router =  express.Router();

const Note = require("../models/Note");

//Get (get all notes)
router.get("/", async(req,res) => {
    try{
        const notes = await Note.find().sort({updatedAt: -1});
        //200 OK
        res.status(200).json(notes);
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message: "Failed to retrieve notes",
            error: e.message
        });
    }
});

//Post (create a new note)
router.post("/", async(req,res) =>{
    try{
        const {title, content} = req.body;

        if(!title || !title.trim()){
            //400 Bad Request
            return res.status(400).json({
                message: "Note tite is required"
            });
        }

        if(!content || !content.trim()){
            //400 Bad Request
            return res.status(400).json({
                message: "Note content is required"
            });
        }

        const newNote = new Note({
            title,
            content
        });

        const savedNote = await newNote.save();

        //201 Created
        res.status(201).json(savedNote);
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message: "Failed to create note",
            error: e.message
        });
    }
});

//Put (update an existing note)
router.put("/:id", async(req,res) =>{
    try{
        if(!req.body){
            //400 Bad Request
            return res.status(400).json({
                message: "Request body is missing"
            });
        }

        const {title, content} = req.body;

        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            {title,content},
            {new: true, runValidators: true}
        );

        if(!updatedNote){
            // 404 Not Found
            return res.status(404).json({
                message : "Note not found"
            });
        }

        //200 OK
        res.status(200).json(updatedNote);
    }
    catch(e){
        //400 Bad Request
        res.status(400).json({
            message: "Failed to update note",
            error: e.message
        });
    }
});

//Delete (delete a note)
router.delete("/:id", async(req,res) =>{
    try{
        const deletedNote = await Note.findByIdAndDelete(req.params.id);

        if(!deletedNote){
            //404 Not Found
            return res.status(404).json({
                message: "Note not found"
            });
        }

        // 200 OK
        res.status(200).json({
            message: "Note deleted successfilly"
        });
    }
    catch(e){
        //400 Internal Server Error
        res.status(400).json({
            message : "Failed to delete note",
            error : e.message
        });
    }
});

module.exports = router;
