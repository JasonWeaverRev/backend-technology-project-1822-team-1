const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const bucketClient = new S3Client({ region: "us-east-1" });

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
    Key: { email },
    UpdateExpression: "SET about_me = :text",
    ExpressionAttributeValues: {
      ":text": text,
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const data = await documentClient.send(command);
    return { email, text };
  } catch (err) {
    console.error("Error updating About Me section: ", err);
    throw { status: 500, message: "Error updating About Me" };
  }
}

const getUserByEmail = async (email) => {
  try {
    const command = new GetCommand({
      TableName,
      Key: { email },
    });
    console.log(email);
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
        ":username": { S: username },
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

  if (typeof username !== "string") {
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

    const userRole = result.Items[0]["role"];
    console.log("User role retrieved:", userRole);
    return userRole;
  } catch (err) {
    console.error("Error fetching user role:", err);
    return null;
  }
};

async function uploadProfilePicAndUpdateDB(email, file_name, mime, data) {
  // Convert base64 to buffer
  const buffer = Buffer.from(data, "base64");
  const file_ext = mime.split("/")[1];
  const bucketName = "dungeon-delver-bucket";
  const objectName = `profile_pics/${file_name}.${file_ext}`;

  try {
    // Upload image to S3
    const response = await uploadImageToBucket(
      bucketName,
      objectName,
      mime,
      buffer
    );
    console.log("in the dao layer: ", response);

    // Generate pre-signed URL
    const presignedUrl = await getPreSignedUrl(bucketName, objectName);

    // Update user profile pic in DynamoDB
    const updateResponse = await updateUserProfilePic(email, presignedUrl);

    return { updateResponse, presignedUrl };
  } catch (error) {
    console.error("Error in profile pic upload and DB update: ", error);
    throw error;
  }
}

// helper function to upload image to S3 bucket
async function uploadImageToBucket(Bucket, Key, mime, buffer) {
  console.log("Bucket:", Bucket);
  console.log("Key:", Key);
  console.log("MIME Type:", mime);
  console.log("Buffer Size:", buffer.length);

  const command = new PutObjectCommand({
    Bucket,
    Key,
    Body: buffer,
    ContentType: mime,
  });

  try {
    const response = await bucketClient.send(command);
    return response;
  } catch (err) {
    console.error(err);
  }
}

// helper function to generate pre-signed url
async function getPreSignedUrl(Bucket, Key) {
  const command = new GetObjectCommand({ Bucket, Key });
  return getSignedUrl(bucketClient, command, { expiresIn: 3600 });
}

// helper function updating profile pic field in DB
async function updateUserProfilePic(email, presignedURL) {
  const command = new UpdateCommand({
    TableName,
    Key: { email },
    UpdateExpression: "SET profile_pic = :profilePicURL",
    ExpressionAttributeValues: {
      ":profilePicURL": presignedURL,
    },
    ReturnValues: "UPDATED_NEW",
  });

  try {
    const data = await documentClient.send(command);
    return data;
  } catch (err) {
    console.error("Error updating user profile picture: ", err);
    throw { status: 500, message: "Error updating profile picture" };
  }
}

module.exports = {
  getUserByEmail,
  getUserByUsername,
  registerUser,
  isUsernameTaken,
  isEmailTaken,
  //addPostToUserForumPosts,
  //deletePostFromUserForums,
  updateAboutMe,
  uploadProfilePicAndUpdateDB,
  getPreSignedUrl,
};
