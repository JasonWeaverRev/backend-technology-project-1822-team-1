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

const getUserByEmail = async (email) => {
  console.log("inside getUserByEmail");
  try {
    const command = new GetCommand({
      TableName,
      Key: { email },
    });

    const data = await documentClient.send(command);
    return data.Item || null;
  } catch (err) {
    throw { status: 500, message: "Error retrieving  user by email" };
  }
};

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

    const userData = (data.Items || []).map((item) => ({
      password: item.password.S,
      about_me: item.about_me.S,
      role: item.role.S,
      creation_time: item.creation_time.S,
      username: item.username.S,
      email: item.email.S,
      profile_pic: item.profile_pic.S,
      encounter_campaigns: item.encounter_campaigns.L,
      encounters: item.encounters.L,
      interacted_posts: item.interacted_posts.L,
      forum_posts: item.forum_posts.L,
    }));

    return userData[0] || null;
  } catch (err) {
    throw { status: 500, message: "Error retrieving user by username" };
  }
};

module.exports = {
  getUserByEmail,
  getUserByUsername,
};
