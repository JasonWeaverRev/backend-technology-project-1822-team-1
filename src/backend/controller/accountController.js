const express = require("express");
const router = express.Router();
const AccountService = require("../service/accountService");
const AuthMiddleware = require("../middleware/authMiddleware");

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

    The only fields required for REGISTRATION are email, username, password
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
// user registration
router.post("/register", async (req, res) => {
  try {
    const newUser = await accountService.registerUser(req.body);
    return res.status(201).json({ message: "New user registered", newUser });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const token = await accountService.loginUser(identifier, password);

    res.status(200).json({ token });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

router.put("/about-me", AuthMiddleware.verifyToken, async (req, res) => {
    const { about_me } = req.body;

    try {
        const email = req.user.email;
        const result = await AccountService.updateAboutMe(email, about_me);

        res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
})

module.exports = router;
