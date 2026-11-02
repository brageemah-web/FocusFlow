const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const protect = require("../middleware/authMiddleware");

// Post (send a message)
router.post("/:conversationId", protect, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Message text is required"
            });
        }

        // check if the conversation exists
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            participants: req.user.id
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const message = await Message.create({
            conversation: conversation._id,
            sender: req.user.id,
            text: text.trim()
        });

        // update conversations updatedAt timestamp
        conversation.updatedAt = new Date();
        await conversation.save();

        const populatedMessage = await message.populate(
            "sender",
            "name email"
        );

        // Get Socket.IO instance
        const io = req.app.get("io");

        // Broadcast message to everyone in the conversation room
        io.to(conversation._id.toString()).emit(
            "receive_message",
            populatedMessage
        );

        res.status(201).json({
            message: "Message sent successfully",
            data: populatedMessage
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send message",
            error: error.message
        });
    }
});

// Get (retrieve messages in a conversation)
router.get("/:conversationId", protect, async (req, res) => {
    try {
        // check if the logged-in user belongs to the conversation
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            participants: req.user.id
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const messages = await Message.find({
            conversation: conversation._id
        })
        .populate("sender", "name email")
        .sort({ createdAt: 1 });

        res.status(200).json({
            count: messages.length,
            messages
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve messages",
            error: error.message
        });
    }
});

// Put (mark messages as read)
router.put("/:conversationId/read", protect, async (req, res) => {
    try {
        // check is the user belongs to the conversation
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            participants: req.user.id
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        // mark messages sent by the other participant as read
        const result = await Message.updateMany(
            {
                conversation: conversation._id,
                sender: { $ne: req.user.id },
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        res.status(200).json({
            message: "Messages marked as read",
            updatedCount: result.modifiedCount
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to mark messages as read",
            error: error.message
        });
    }
});


// Delete (delete a message)
router.delete("/:conversationId/:messageId", protect, async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            participants: req.user.id
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const message = await Message.findOneAndDelete({
            _id: req.params.messageId,
            conversation: conversation._id,
            sender: req.user.id
        });

        if (!message) {
            return res.status(404).json({
                message: "Message not found or you cannot delete this message"
            });
        }

        res.status(200).json({
            message: "Message deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete message",
            error: error.message
        });
    }
});

module.exports = router;