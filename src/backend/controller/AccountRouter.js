const express = require("express");
const router = express.Router();
const AccountService = require("../service/AccountService");
const { authenticateToken, authenticateManagerToken } = require("./Middleware");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const secretKey = fs.readFileSync(path.join(__dirname, '../../secretkey.txt'), 'utf8').trim();

/*
    DDUser Object Model
        {
            email : String
            about_me : String
            encounter_campaigns : List
            creation_time : String
            encounters : List
            forum_posts : List
            interacted_posts : List
            password : String
            username : String
            profile_pic : String
            role : String (admin / user)
        }
*/

// GET user by email
router.get("/email", async (req, res) => {
    const emailQuery = req.query.email;

    try {
        if (emailQuery) {
            const user = await AccountService.getUserByEmail(emailQuery);

            if (user) {
                return res.status(200).json({ message: "User found", user });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        } else {
            return res.status(400).json({ message: "Email not provided" });
        }
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET user by username
router.get("/username", async (req, res) => {
    const usernameQuery = req.query.username;

    try {
        if (usernameQuery) {
            const user = await AccountService.getUserByUsername(usernameQuery);

            if (user) {
                return res.status(200).json({ message: "User found", user });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        } else {
            return res.status(400).json({ message: "Username not provided" });
        }
    } catch (error) {
        console.error("Error fetching user by username:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST register user
router.post("/register", async (req, res) => {
    try {
        const newUser = await AccountService.registerUser(req.body);
        return res.status(201).json({ message: "New user registered", newUser });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

// POST login (example if you want to add JWT-based login)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await AccountService.getUserByEmail(email);

        if (user && password === user.password) {
            const token = jwt.sign(
                { email: user.email, role: user.role },
                secretKey,
                { expiresIn: "1d" }
            );
            return res.status(200).json({ message: "Login successful", token });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Protected route (user-level)
router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

// Manager-only protected route
router.get("/manager-protected", authenticateManagerToken, (req, res) => {
    res.json({ message: "This is a manager-only protected route", user: req.user });
});

module.exports = router;