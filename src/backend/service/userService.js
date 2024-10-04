const userDao = require("../dao/userDao");
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

    // console.log(user.encounters[0]);

    // const userEncounterData = await encounterDao.getEncounterById(
    //   user.encounters[0]
    // );
    // console.log(userEncounterData);

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
