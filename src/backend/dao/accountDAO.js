
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

// Update about_me section of user profile
async function updateAboutMe(email, text) {
  const command = new UpdateCommand({
    TableName,
      Key: {email},
      UpdateExpression: 'SET about_me = :text',
      ExpressionAttributeValues: {
          ':text': text
      },
      ReturnValues: "ALL_NEW"
    })

    try {
      const data = await documentClient.send(command);
      return {email, text};
    } catch (err) {
      console.error("Error updating About Me section: ", err);
      return null;
    }
}

async function updateProfilePic(email, image) {
  // need to look into Amazon S3
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


const getUserRoleByUsername = async (username) => {
    console.log("getUserRoleByUsername called with username:", username);
  
    if (typeof username !== 'string') {
      console.error("Username is not a string. Converting to string.");
      username = String(username);
    }
  
    try {
      const command = new QueryCommand({
        TableName,
        IndexName: "username-index",
        KeyConditionExpression: "#username = :username",
        ExpressionAttributeNames: {
          "#username": "username",
          "#r": "role",
        },
        ExpressionAttributeValues: {
          ":username": username,
        },
        ProjectionExpression: "#r",
      });
  
      const result = await documentClient.send(command);
  
      if (!result.Items || result.Items.length === 0) {
        console.log("User not found.");
        return null;
      }
  
      const userRole = result.Items[0]['role'];
      console.log("User role retrieved:", userRole);
      return userRole;
    } catch (err) {
      console.error("Error fetching user role:", err);
      return null;
    }
  };
  


module.exports = {
  getUserByEmail,
  getUserByUsername,
  registerUser,
  isUsernameTaken,
  isEmailTaken,
  addPostToUserForumPosts,
  deletePostFromUserForums,
  updateAboutMe
};
