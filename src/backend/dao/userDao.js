const {
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const { logger } = require("../utils/logger"); // Assuming you have a logger utility

const encounterDao = require("../dao/encounterDao");

const client = new DynamoDBClient({ region: "us-east-1" });

const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "Dungeon_Delver_Users";


// Log which database you are connecting to
logger.info(`Connecting to DynamoDB Table: ${TableName} in region: us-east-1`);


/**
 * 
 * @param {*} email email of user to search for
 * @returns metadata of the found user, or throws an error if not found
 */
const getUserByEmail = async (email) => {
  try {
    const command = new GetCommand({
      TableName,
      Key: { email },
    });

    const data = await documentClient.send(command);

    const userData = data.Item;

    if (userData && userData.encounters && userData.encounters.length > 0) {
      const encounterData = await encounterDao.getBatchEncountersbyId(
        userData.encounters
      );
      userData.encounters = encounterData;
    }

    return userData || null;
  } catch (err) {
    console.error(err);
    throw { status: 500, message: "Error retrieving  user by email" };
  }
};

/**
 * 
 * @param {*} username username of user 
 * @returns metadata of the user if found, or throws an error otherwise
 */
const getUserByUsername = async (username) => {
  
  try {
    const command = new QueryCommand({
      TableName,
      IndexName: "username-index",
      KeyConditionExpression: "#username = :username",
      ExpressionAttributeNames: {
        "#username": "username",
      },
      ExpressionAttributeValues: {
        ":username": {S: username}
      },
    });

    const data = await documentClient.send(command);

    // const encounterIds = [];
    // data.Items[0].encounters.L.forEach((idx) => {
    //   encounterIds.push(idx.S);
    // });

    // const encounterData = await encounterDao.getBatchEncountersbyId(
    //   encounterIds
    // );

    // const userData = (data.Items || []).map((item) => ({
    //   password: item.password.S,
    //   about_me: item.about_me.S,
    //   role: item.role.S,
    //   creation_time: item.creation_time.S,
    //   username: item.username.S,
    //   email: item.email.S,
    //   profile_pic: item.profile_pic.S
    //   // encounter_campaigns: item.encounter_campaigns.L,
    //   // encounters: encounterData,
    //   // interacted_posts: item.interacted_posts.L,
    //   // forum_posts: item.forum_posts.L,
    // }));

    // return userData[0] || null;

    if (data.Items && data.Items.length > 0) {
      return data.Items[0]; // Return the first item if it exists
    } 
    else {
      throw new Error('No user found with the given username');
    }

  } catch (err) {
    console.error(err);
    throw { status: 500, message: "Error retrieving user by username" };
  }
};

/**
 * 
 * @param {*} postID post id to add to the user's profile
 * @param {*} username username of the user to have the post added to
 */
const addPostToUserForumPosts = async(postID, username) => {
  // Retrieve email from the associated username to get DB's original PK
  const user = await getUserByUsername(username);
  const email = user.email.S;
  
  const command = new UpdateCommand( {
    TableName,
    Key: {
        email
    },
    UpdateExpression: 'SET forum_posts = list_append(if_not_exists(forum_posts, :emptyList), :newString)',
    ExpressionAttributeValues: {
        ":newString": [postID],
        ":emptyList": []
    }
  });

  try {
      const data = await documentClient.send(command);
      return data;
  } catch(err) {
      console.error(err);
      throw { status: 500, message: "Error updating user's forum posts" };
  }
};

/**
 * 
 * @param {*} postID post id to remove from the user's profile
 * @param {*} username username of the user to have the post removed from
 */
const deletePostFromUserForums = async(postID, username) => {
  // Retrieve email from the associated username to get DB's original PK
  const user = await getUserByUsername(username);
  const forumPosts = user.forum_posts.L;
  const ind = forumPosts.findIndex(id => id.S === postID); 
  const email = user.email.S;

  const command = new UpdateCommand( {
    TableName,
    Key: {
        email
    },
    UpdateExpression: `REMOVE #forum_posts[${ind}]`,
    ExpressionAttributeNames: {
      '#forum_posts': 'forum_posts'
    }
  });

  

  try {
      const data = await documentClient.send(command);
      return data;
  } catch(err) {
      console.error(err);
      throw { status: 500, message: "Error removing post from user's forum posts" };
  }
}

module.exports = {
  getUserByEmail,
  getUserByUsername,
  addPostToUserForumPosts,
  deletePostFromUserForums
};
