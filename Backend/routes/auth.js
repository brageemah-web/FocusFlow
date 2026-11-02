const express =  require("express");
const router = express.Router();
const protect  = require("../middleware/authMiddleware");

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const updatedName = name.trim();
        const updatedEmail = email.trim().toLowerCase();

        if (!updatedName || !updatedEmail) {
            return res.status(400).json({
                message: "Name and email cannot be empty"
            });
        }

        const existingUser = await User.findOne({
            email: updatedEmail,
            _id: { $ne: req.user.id }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This email is already in use"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: updatedName,
                email: updatedEmail
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

module.exports = router;