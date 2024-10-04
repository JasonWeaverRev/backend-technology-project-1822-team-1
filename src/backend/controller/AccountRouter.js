const express = require("express");
const router = express.Router();
const AccountService = require("../service/AccountService");
// const { authenticateToken, authenticateManagerToken } = require("./Middleware");
// const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
// const secretKey = fs.readFileSync(path.join(__dirname, '../../secretkey.txt'), 'utf8').trim();

/*
    DDUser Object Model
        {
            email : String   -partition key
            about_me : String
            enounter_campaigns : List
            creation_time : String
            enounters : List	Still in progress, but would contain a list of encounters
            forum_posts : List	Still in progress, but would contain a list of posts
            interacted_posts : List	Still in progress, but would contain a list of interacted posts
            password : String	golemguy420
            username : String	xXgolemzlifeXx
            profile_pic : String	/resources/pictures/golem.png (example string?)
            role : String	admin / user
        }
*/

/* GET user by email
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
*/

/* GET user by username
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
*/

// POST user registration
router.post("/register", async (req, res) => {
    try {
        const newUser = await AccountService.registerUser(req.body);
        return res.status(201).json({ message: "New user registered", newUser });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});


module.exports = router;