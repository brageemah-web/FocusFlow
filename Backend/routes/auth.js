const express =  require("express");
const router = express.Router();

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

module.exports = router;