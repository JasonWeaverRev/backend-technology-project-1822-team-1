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

const client = new DynamoDBClient({ region: "us-east-1" });

const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "Dungeon_Delver_Users";

/*
    DDUser Object Model
        {
            email : String   -partition key
            about_me : String
            enounter_campaigns : List
            creation_time : String
            enounters : List	Still in progress, but would contain a list of encounters
            forum_posts : List	Still in progress, but would contain a list of posts
            interacted_pos1s : List	Still in progress, but would contain a list of interacted posts
            password : String	golemguy420
            username : String	xXgolemzlifeXx
            profile_pic : String	/resources/pictures/golem.png (example string?)
            role : String	admin / user
        }
*/

// // GET user by email (partition key)
// async function getUserByEmail(email) {
//   const command = new GetCommand({
//     TableName,
//     Key: { email },
//   });

//   try {
//     const data = await documentClient.send(command);
//     return data.Item || null;
//   } catch (err) {
//     console.error("Error fetching user by email:", err);
//     return null;
//   }
// }

// // GET user by username
// async function getUserByUsername(username) {
//   const command = new QueryCommand({
//     TableName,
//     IndexName: "username-index",
//     KeyConditionExpression: "#username = :username",
//     ExpressionAttributeNames: { "#username": "username" },
//     ExpressionAttributeValues: { ":username": username },
//   });

//   try {
//     const data = await documentClient.send(command);
//     return data.Items.length === 0 ? null : data.Items[0];
//   } catch (err) {
//     console.error("Error fetching user by username:", err);
//     return null;
//   }
// }

// POST user
async function registerUser(user) {
  const command = new PutCommand({
    TableName,
    Item: user,
  });

  try {
    const data = await documentClient.send(command);
    return user;
  } catch (err) {
    console.error("Error registering user:", err);
    return null;
  }
}

// Check if username is taken
async function isUsernameTaken(username) {
  const user = await getUserByUsername(username);

  return user !== null;
}

// Check if email is taken
async function isEmailTaken(email) {
  const user = await getUserByEmail(email);
  return user !== null;
}

const getUserByEmail = async (email) => {
  try {
    const command = new GetCommand({
      TableName,
      Key: { email },
    });

    const data = await documentClient.send(command);

    return data.Item || null;
  } catch (err) {
    console.error(err);
    throw { status: 500, message: "Error retrieving  user by email" };
  }
};


/**
 * 
 * @param {*} username 
 * @returns 
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

    return data.Items[0] || null;
  } catch (err) {
    throw { status: 500, message: "Error retrieving user by username" };
  }
};

/**
 * Adds a post id to its respective user's forum posts list
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
 * Removes a post id from its respective user's forum posts list
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

  // If the post could not be found in the user's post list
  if (ind === -1) {
    console.log("Warning: post did not appear in any user's post list");
    return -1;
  }

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
  registerUser,
  isUsernameTaken,
  isEmailTaken,
  addPostToUserForumPosts,
  deletePostFromUserForums
};
