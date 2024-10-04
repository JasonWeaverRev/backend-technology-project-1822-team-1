const AccountDao = require("../dao/AccountDAO");

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

// Get user by email (partition key)
async function getUserByEmail(email) {
    const user = await AccountDao.getUserByEmail(email);
    return user;
}

// Get user by username
async function getUserByUsername(username) {
    const user = await AccountDao.getUserByUsername(username);
    return user;
}

async function registerUser(user) {
    const {email, username, password} = user;

    // Validate required fields
    if (!email || !username || !password) {
        throw new Error("Email, username, and password are required.");
    }

    // Validate email format (only alphanumeric characters allowed)
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("Invalid email format.");
    }

    // Check that the username is not an email
    if (username.includes('@')) {
        throw new Error("Username cannot contain an '@' symbol.");
    }

    // Checks password length (may require other condiditons in future)
    if (password.length < 8) {
        throw new Error("Your password must be at least 8 characters long")
    }
    
    // Check if email is already taken
    const emailTaken = await AccountDao.isEmailTaken(email);
    if (emailTaken) {
        throw new Error("Email is already registered");
    }

    // Check if username is already taken
    const usernameTaken = await AccountDao.isUsernameTaken(username);
    if (usernameTaken) {
        throw new Error("Username is already registered");
    }

    // Defaults role to "user" if not an "admin"
    if (!user.role || user.role.toLowerCase() !== "admin") {
        user.role = "user";
    } else {
        user.role = "admin";
    }

    // Gets current date
    user.creation_time = new Date().toJSON().slice(0, 10);

    const registeredUser = await AccountDao.registerUser(user);
    return registeredUser;
}

module.exports = {
    getUserByEmail,
    getUserByUsername,
    registerUser
};