const userDao = require("../dao/userDao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");
const secret = process.send.JWT_SECRET;

const loginUser = async (identifier, password) => {
  if (!identifier || !password) {
    logger.info(`Failed login attempt: Invalid credentials`);
    throw { status: 400, message: "Invalid username/email or password" };
  }

  try {
    const user = identifier.includes("@")
      ? await userDao.getUserByUsername(identifier)
      : userDao.getUserByEmail(identifier);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.info(
        `Failed login attempt: Invalid credentials for ${
          username ? username : email
        }`
      );
      throw { status: 401, message: "Invalid username/email or password" };
    }

    const token = jwt.sign(
      {
        username: user.username,
        email: user.email,
        role: user.role,
        about_me: user.about_me,
        encounter_campaigns: user.encounter_campaigns,
        encouters: user.encounters,
        forum_posts: user.forum_posts,
        interacted_posts: user.interacted_posts,
        profile_pic: user.profile_pic,
      },
      secret,
      { expiresIn: "1h" }
    );

    logger.info(`Successful login by ${user.username}`);
    return token;
  } catch (err) {
    throw err.status ? err : { status: 500, message: "Internal server error" };
  }
};

module.exports = {
  loginUser,
};
