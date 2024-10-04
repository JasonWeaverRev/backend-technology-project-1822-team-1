const userDao = require("../dao/userDao");
const encounterDao = require("../dao/encounterDao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");
const secret = process.env.JWT_SECRET;

const loginUser = async (identifier, password) => {
  if (!identifier || !password) {
    logger.info(`Failed login attempt: Invalid credentials`);
    throw { status: 400, message: "Invalid username/email or password" };
  }

  try {
    const user = identifier.includes("@")
      ? await userDao.getUserByEmail(identifier)
      : await userDao.getUserByUsername(identifier);

    //|| !(await bcrypt.compare(password, user.password))
    if (!user) {
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
        about_me: processedUser.about_me,
        encounter_campaigns: processedUser.encounter_campaigns,
        encouters: processedUser.encounters,
        forum_posts: processedUser.forum_posts,
        interacted_posts: processedUser.interacted_posts,
        profile_pic: processedUser.profile_pic,
      },
      secret,
      { expiresIn: "1h" }
    );

    logger.info(`Successful login by ${processedUser.username}`);
    return token;
  } catch (err) {
    console.error(err);
    throw err.status ? err : { status: 500, message: "Internal server error" };
  }
};

const processByEmail = async (user) => {
  const encounterData = [];
  if (user && user.encounters && user.encounters.length > 0) {
    encounterData = await encounterDao.getBatchEncountersbyId(user.encounters);
    user.encounters = encounterData;
  }

  return user;
};

const processByUsername = async (user) => {
  const encounterIds = [];
  user.encounters.L.forEach((idx) => {
    encounterIds.push(idx.S);
  });

  const encounterData = [];

  if (user && user.encounters && user.encounters.length > 0) {
    encounterData = await encounterDao.getBatchEncountersbyId(encounterIds);
  }

  const encounterCampaigns = [];
  user.encounter_campaigns.L.forEach((idx) => {
    encounterCampaigns.push(idx.S);
  });

  const interactedPosts = [];
  user.interacted_posts.L.forEach((idx) => {
    interactedPosts.push(idx.S);
  });

  const forumPosts = [];
  user.forum_posts.L.forEach((idx) => {
    forumPosts.push(idx.S);
  });

  const processedUser = {
    password: user.password.S,
    about_me: user.about_me.S,
    role: user.role.S,
    creation_time: user.creation_time.S,
    username: user.username.S,
    email: user.email.S,
    profile_pic: user.profile_pic.S,
    encounter_campaigns: encounterCampaigns,
    encounters: encounterData,
    interacted_posts: interactedPosts,
    forum_posts: forumPosts,
  };

  return processedUser;
};

module.exports = {
  loginUser,
};
