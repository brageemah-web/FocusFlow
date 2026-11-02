const express = require("express");
const router = express.Router();

const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const protect = require("../middleware/authMiddleware");

// Get (search for users)
router.get("/search", protect, async (req, res) => {
    try {
        const { search } = req.query;

        if (!search || !search.trim()) {
            // 400 Bad Request
            return res.status(400).json({
                message: "Search term is required"
            });
        }

        const users = await User.find({
            _id: { $ne: req.user.id },
            $or: [
                { name: { $regex: search.trim(), $options: "i" } },
                { email: { $regex: search.trim(), $options: "i" } }
            ]
        }).select("_id name email");

        // 200 OK
        res.status(200).json(users);

    } catch (e) {
        //500 Internal Server Error
        res.status(500).json({
            message: "Failed to search for users",
            error: e.message
        });
    }
});

// Post (send a friend request)
router.post("/request/:userId", protect, async (req, res) => {
    try {
        const receiverId = req.params.userId;
        const senderId = req.user.id;

        if (senderId === receiverId) {
            //400 Bad Request
            return res.status(400).json({
                message: "You cannot send a friend request to yourself"
            });
        }

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            // 404 NOt Found
            return res.status(404).json({
                message: "User not found"
            });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (existingRequest) {
            //400 Bad Request
            return res.status(400).json({
                message: "A friend request or friendship already exists"
            });
        }

        const newRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId
        });

        const savedRequest = await newRequest.save();

        // 201 Created
        res.status(201).json({
            message: "Friend request sent successfully",
            request: savedRequest
        });

    } catch (e) {
        // 500 Internal Server Error
        res.status(500).json({
            message: "Failed to send friend request",
            error: e.message
        });
    }
});

//Get (retrieve incoming friend requests)
router.get("/requests/received", protect, async(req,res) =>{
    try{
       const requests = await FriendRequest.find({
        receiver : req.user.id,
        status : "pending"
       })
       .populate("sender","name email")
       .sort({createdAt : -1}); 

       //200 OK
       res.status(200).json(requests);
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message : "Failed to retrieve incoming friend request",
            error : e.message
        });
    }
});

//Get (retrieve outgoing friend requests)
router.get("/requests/sent", protect, async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending"
        })
        .populate("receiver", "name email")
        .sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve outgoing friend requests",
            error: error.message
        });
    }
});

// Put (accept a friend request)
router.put("/requests/:requestId/accept", protect, async(req,res) =>{
    try{
        const request = await FriendRequest.findOne({
            _id: req.params.requestId,
            receiver: req.user.id,
            status: "pending"
        });

        if(!request){
            //404 Not Found
            return res.status(404).json({
                message: "Friend request not found"
            });
        }

        request.status = "accept";

        const updatedRequest = await request.save();

        //200 OK
        res.status(200).json({
            message: "Friend request accepted successfully",
            request: updatedRequest
        });
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message: "Failed to accept friend request",
            error: e.message
        });
    }
});

//Put (reject a friend request)
router.put("/requests/:requestId/reject", protect, async(req,res) =>{
    try{
        const request = await FriendRequest.findOne({
            _id: req.params.requestId,
            receiver: req.user.id,
            status: "pending"
        });

        if(!request){
            //404 Not Found
            return res.status(404).json({
                message: "Friend request not found"
            });
        }

        request.status = "reject";

        const updatedRequest = await request.save();

        //200 OK
        res.status(200).json({
            message: "Friend request rejected successfully",
            request: updatedRequest
        });
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message: "Failed to reject friend request",
            error: e.message
        });
    }
});

//Get (retrieve accepted friends)
router.get("/", protect, async(req,res)=>{
    try{
        const friendships = await FriendRequest.find({
            status: "accept",
            $or: [
                {sender: req.user.id},
                {receiver: req.user.id}
            ]
        })
        .populate("sender","name email")
        .populate("receiver","name email");

        const friends = friendships.map((friendship) =>{
            const friend = friendship.sender._id.toString() === req.user.id ?
            friendship.receiver :
            friendship.sender;

            return{
                _id: friend._id,
                name: friend.name,
                email: friend.email
            };
        });

        //200 OK
        res.status(200).json({
            count: friends.length,
            friends
        })
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message: "Failed to retrieve friends",
            error: e.message
        });
    }
});

// Delete (cancel a sent friend request)
router.delete("/requests/:requestId/cancel", protect, async (req, res) => {
    try {
        const request = await FriendRequest.findOne({
            _id: req.params.requestId,
            sender: req.user.id,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                message: "Pending friend request not found."
            });
        }

        await FriendRequest.findByIdAndDelete(request._id);

        res.json({
            message: "Friend request cancelled."
        });

    } catch (error) {
    console.error("Cancel request error:", error);

    res.status(500).json({
        message: error.message
    });
}
});


module.exports = router;