const express =  require("express");
const router = express.Router();
const protect  = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");


const Task = require("../models/Task");
const Note = require("../models/Note");
const CalendarEvent = require("../models/CalendarEvent");
const Pomodoro = require("../models/Pomodoro");
const FriendRequest = require("../models/FriendRequest");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

//Post (register a new user)
router.post("/register", async(req,res) => {
    try{
        const {name,email,password} = req.body

        //check that all fields are provided
        if(!name || !email || !password){
            //400 Bad Request
            return res.status(400).json({
                message : "Please provide name, email and password"
            });
        }

        //chack password length
        if(password.length < 6){
            // 400 Bad Request
            res.status(400).json({
                message : "Password must be at least 6 characters long"
            });
        }

        //check if email is already registered
        const existingUser = await User.findOne({email});

        if(existingUser){
            // 409 Conflict
            return res.status(409).json({
                message : "An account with this email already exists"
            });
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create the user
        const newUser = new User({
            name,  
            email,
            password : hashedPassword
        });

        const savedUser = await newUser.save();

         // Return user details without the password
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

//Post (login an existing user)
router.post("/login",async(req,res) => {
    try{
        const {email, password} = req.body;

        //chck if all fields are provided
        if(!email || !password){
            //400 Bad Request
            return res.status(400).json({
                message : "Please provide email and password"
            });
        }

        //find the user by email
        const user = await User.findOne({email});

        if(!user){
            //401 Unauthorized
            return res.status(401).json({
                message : "Invalid email or password"
            });
        }

        //compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            //401 Unauthorized
            return res.status(401).json({
                message : "Invalid email or password"
            });
        }

        //generate a JWT
        const token = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn : "1d"}
        );

        //return token and user details
        //200 OK
        res.status(200).json({
            message : "Login successful",
            token,
            user : {
                id: user._id,
                name : user.name,
            }
        });
    }
    catch(e){
        //500 Internal Server Error
        res.status(500).json({
            message : "Login Failed",
            error : e.message
        });
    }
});

// Get logged-in user's profile
router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve profile",
            error: error.message
        });
    }
});

// Update logged-in user's profile
router.put("/me", protect, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const updatedName = name.trim();

        if (!updatedName) {
            return res.status(400).json({
                message: "Name cannot be empty"
            });
        }


        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: updatedName,
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
});

// change password
router.put("/change-password", protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Please provide your current and new password"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to change password",
            error: error.message
        });
    }
});

// Request password reset
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Please provide your email address"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        // Use the same response whether the account exists or not.
        const responseMessage =
            "If an account exists with this email, a reset link has been sent.";

        if (!user) {
            return res.status(200).json({
                message: responseMessage
            });
        }

        // Generate a secure random token.
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash the token before storing it.
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Build the reset link.
        const resetLink =
            `http://localhost:5173/reset-password/${resetToken}`;

        // Send the email.
        try {
            await sendEmail(
                user.email,
                "FocusFlow Password Reset",
                `
                    <h2>Reset Your FocusFlow Password</h2>
                    <p>We received a request to reset your password.</p>
                    <p>Click the link below to create a new password:</p>
                    <a href="${resetLink}">Reset Password</a>
                    <p>This link expires in 15 minutes.</p>
                    <p>If you did not request this, you can ignore this email.</p>
                `
            );
        } catch (emailError) {
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            throw emailError;
        }

        res.status(200).json({
            message: responseMessage
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        res.status(500).json({
            message: "Unable to process password reset request"
        });
    }
});

// Reset password using token
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                message: "Please provide a new password"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        // Hash the token received from the reset link.
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with a valid, unexpired token.
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Password reset link is invalid or has expired"
            });
        }

        // Hash and save the new password.
        user.password = await bcrypt.hash(newPassword, 10);

        // Invalidate the reset token.
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({
            message: "Password reset successfully. You can now log in."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        res.status(500).json({
            message: "Unable to reset password"
        });
    }
});

// Delete logged-in user's account
router.delete("/me", protect, async (req, res) => {
    let session;

    try {
        session = await mongoose.startSession();

        const { password } = req.body;

        // Check that the password was provided
        if (!password) {
            return res.status(400).json({
                message: "Please provide your current password"
            });
        }

        // Find the logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Verify the current password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        // Delete the account and associated data together
        await session.withTransaction(async () => {

            const userId = user._id;

            // Delete personal data
            await Task.deleteMany(
                { user: userId },
                { session }
            );

            await Note.deleteMany(
                { user: userId },
                { session }
            );

            await CalendarEvent.deleteMany(
                { user: userId },
                { session }
            );

            await Pomodoro.deleteMany(
                { user: userId },
                { session }
            );

            // Delete incoming and outgoing friend requests
            await FriendRequest.deleteMany(
                {
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                },
                { session }
            );

            // Find conversations involving this user
            const conversations = await Conversation.find({
                participants: userId
            })
                .select("_id")
                .session(session);

            const conversationIds = conversations.map(
                conversation => conversation._id
            );

            // Delete messages sent by this user
            await Message.deleteMany(
                { sender: userId },
                { session }
            );

            // Remove the user from conversations
            await Conversation.updateMany(
                { _id: { $in: conversationIds } },
                {
                    $pull: {
                        participants: userId
                    }
                },
                { session }
            );

            // Find conversations with no remaining participants
            const emptyConversations = await Conversation.find({
                _id: { $in: conversationIds },
                participants: { $size: 0 }
            })
                .select("_id")
                .session(session);

            const emptyConversationIds = emptyConversations.map(
                conversation => conversation._id
            );

            // Remove messages belonging to empty conversations
            if (emptyConversationIds.length > 0) {
                await Message.deleteMany(
                    {
                        conversation: {
                            $in: emptyConversationIds
                        }
                    },
                    { session }
                );

                await Conversation.deleteMany(
                    {
                        _id: {
                            $in: emptyConversationIds
                        }
                    },
                    { session }
                );
            }

            // Finally, delete the user account
            await User.findByIdAndDelete(userId).session(session);
        });

        res.status(200).json({
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Account deletion error:", error);

        res.status(500).json({
            message: "Failed to delete account. Please try again."
        });

    } finally {
        if (session) {
            await session.endSession();
        }
    }
});

module.exports = router;