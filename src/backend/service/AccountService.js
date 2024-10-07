const AccountDao = require("../dao/AccountDAO");
const encounterDao = require("../dao/encounterDao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");
const secret = process.env.JWT_SECRET;

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
/**
 * 
 * @param {*} email 
 * @returns 
 */
async function getUserByEmail(email) {
  const user = await AccountDao.getUserByEmail(email);
  return user;
}

// Get user by username
/**
 * 
 * @param {*} username 
 * @returns 
 */
async function getUserByUsername(username) {
  const user = await AccountDao.getUserByUsername(username);
  return user;
}

/**
 * 
 * @param {*} user 
 * @returns 
 */
async function registerUser(user) {
  const { email, username, password, role } = user;

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
  if (username.includes("@")) {
    throw new Error("Username cannot contain an '@' symbol.");
  }

  // Checks password length (may require other condiditons in future)
  if (password.length < 8) {
    throw new Error("Your password must be at least 8 characters long");
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

  const saltRounds = 10;
  hashedPassword = await bcrypt.hash(password, saltRounds);
  encounters = [];
  encounter_campaigns = [];
  forum_posts = [];
  interacted_posts = [];
  

  const newUser = {
    email,
    username,
    password: hashedPassword,
    role,
    encounters,
    encounter_campaigns,
    forum_posts,
    interacted_posts
  };

  // Defaults role to "user" if not an "admin"
  if (!user.role || user.role.toLowerCase() !== "admin") {
    newUser.role = "user";
  } else {
    newUser.role = "admin";
  }

  // Gets current date
  newUser.creation_time = new Date().toJSON().slice(0, 10);

  const registeredUser = await AccountDao.registerUser(newUser);
  return registeredUser;
}

/**
 * 
 * @param {*} identifier 
 * @param {*} password 
 * @returns 
 */
const loginUser = async (identifier, password) => {
  if (!identifier || !password) {
    logger.info(`Failed login attempt: Invalid credentials`);
    throw { status: 400, message: "Invalid username/email or password" };
  }

  try {
    const user = identifier.includes("@")
      ? await AccountDao.getUserByEmail(identifier)
      : await AccountDao.getUserByUsername(identifier);

    if (
      !user ||
      !(await bcrypt.compare(
        password,
        identifier.includes("@") ? user.password : user.password.S
      ))
    ) {
      logger.info(
        `Failed login attempt: Invalid credentials for ${identifier}`
      );
      throw { status: 401, message: "Invalid username/email or password" };
    }

    const processedUser = identifier.includes("@")
      ? await processByEmail(user)
      : await processByUsername(user);

    const token = jwt.sign(
      {
        username: processedUser.username,
        email: processedUser.email,
        role: processedUser.role,
        // about_me: processedUser.about_me,
        // encounter_campaigns: processedUser.encounter_campaigns,
        // encouters: processedUser.encounters,
        // forum_posts: processedUser.forum_posts,
        // interacted_posts: processedUser.interacted_posts,
        // profile_pic: processedUser.profile_pic,
      },
      secret,
      { expiresIn: "2h" }
    );

    logger.info(`Successful login by ${processedUser.username}`);
    return token;
  } catch (err) {
    console.error(err);
    throw err.status ? err : { status: 500, message: "Internal server error" };
  }
};

/**
 * 
 * @param {*} user 
 * @returns 
 */
const processByEmail = async (user) => {
  let encounterData = [];
  if (user && user.encounters && user.encounters.length > 0) {
    encounterData = await encounterDao.getBatchEncountersbyId(user.encounters);
    user.encounters = encounterData;
  }

  return user;
};

/**
 * 
 * @param {*} user 
 * @returns 
 */
const processByUsername = async (user) => {
  // const encounterIds = [];
  // user.encounters.L.forEach((idx) => {
  //   encounterIds.push(idx.S);
  // });

  // const encounterData = [];

  // if (user && user.encounters && user.encounters.length > 0) {
  //   encounterData = await encounterDao.getBatchEncountersbyId(encounterIds);
  // }

  // const encounterCampaigns = [];
  // user.encounter_campaigns.L.forEach((idx) => {
  //   encounterCampaigns.push(idx.S);
  // });

  // const interactedPosts = [];
  // user.interacted_posts.L.forEach((idx) => {
  //   interactedPosts.push(idx.S);
  // });

  // const forumPosts = [];
  // user.forum_posts.L.forEach((idx) => {
  //   forumPosts.push(idx.S);
  // });

  // const processedUser = {
  //   password: user.password.S,
  //   about_me: user.about_me.S,
  //   role: user.role.S,
  //   creation_time: user.creation_time.S,
  //   username: user.username.S,
  //   email: user.email.S,
  //   profile_pic: user.profile_pic.S,
  //   encounter_campaigns: encounterCampaigns,
  //   encounters: encounterData,
  //   interacted_posts: interactedPosts,
  //   forum_posts: forumPosts,
  // };

   const processedUser = {
    password: user.password.S,
    about_me: user.about_me.S,
    role: user.role.S,
    creation_time: user.creation_time.S,
    username: user.username.S,
    email: user.email.S,
    profile_pic: user.profile_pic.S,
    encounter_campaigns: [],
    encounters: [],
    interacted_posts: [],
    forum_posts: [],
  };

  return processedUser;
};

module.exports = {
  getUserByEmail,
  getUserByUsername,
  registerUser,
  loginUser,
};