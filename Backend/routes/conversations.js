const express = require("express");
const router = express.Router();

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const FriendRequest = require("../models/FriendRequest");
const protect = require("../middleware/authMiddleware");

// Post (create or retrieve a conversation)
router.post("/:userId", protect, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const friendId = req.params.userId;

        //prevent users from starting conversations with themselves
        if (currentUserId === friendId) {
            return res.status(400).json({
                message: "You cannot start a conversation with yourself"
            });
        }

        // check is the users are friends
        const friendship = await FriendRequest.findOne({
            status: "accept",
            $or: [
                { sender: currentUserId, receiver: friendId },
                { sender: friendId, receiver: currentUserId }
            ]
        });

        if (!friendship) {
            return res.status(403).json({
                message: "You can only chat with accepted friends"
            });
        }

        // check is a conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, friendId], $size: 2 }
        }).populate("participants", "name email");

        if (conversation) {
            return res.status(200).json({
                message: "Conversation already exists",
                conversation
            });
        }

        // create a new conversation
        conversation = await Conversation.create({
            participants: [currentUserId, friendId]
        });

        conversation = await conversation.populate(
            "participants",
            "name email"
        );

        res.status(201).json({
            message: "Conversation created successfully",
            conversation
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create conversation",
            error: error.message
        });
    }
});

// Get retrieve all conversations for the logged-in user)
router.get("/", protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
            .populate("participants", "name email")
            .sort({ updatedAt: -1 });

        const conversationsWithUnreadCount = await Promise.all(
            conversations.map(async (conversation) => {
                const unreadCount = await Message.countDocuments({
                    conversation: conversation._id,
                    sender: { $ne: req.user.id },
                    isRead: false
                });

                return {
                    ...conversation.toObject(),
                    unreadCount
                };
            })
        );

        res.status(200).json({
            count: conversations.length,
            conversations: conversationsWithUnreadCount
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve conversations",
            error: error.message
        });
    }
});

module.exports = router;