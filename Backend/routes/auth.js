const express =  require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

module.exports = router;