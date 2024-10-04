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

const encounterDao = require("../dao/encounterDao");

const client = new DynamoDBClient({ region: "us-east-1" });

const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "Dungeon_Delver_Users";

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

    // const encounterIds = [];
    // data.Items[0].encounters.L.forEach((idx) => {
    //   encounterIds.push(idx.S);
    // });

    // const encounterData = await encounterDao.getBatchEncountersbyId(
    //   encounterIds
    // );

    // const encounterCampaigns = [];
    // data.Items[0].encounter_campaigns.L.forEach((idx) => {
    //   encounterCampaigns.push(idx.S);
    // });

    // const interactedPosts = [];
    // data.Items[0].interacted_posts.L.forEach((idx) => {
    //   interactedPosts.push(idx.S);
    // });

    // const forumPosts = [];
    // data.Items[0].forum_posts.L.forEach((idx) => {
    //   forumPosts.push(idx.S);
    // });

    // const userData = (data.Items || []).map((item) => ({
    //   password: item.password.S,
    //   about_me: item.about_me.S,
    //   role: item.role.S,
    //   creation_time: item.creation_time.S,
    //   username: item.username.S,
    //   email: item.email.S,
    //   profile_pic: item.profile_pic.S,
    //   encounter_campaigns: encounterCampaigns,
    //   encounters: encounterData,
    //   interacted_posts: interactedPosts,
    //   forum_posts: forumPosts,
    // }));

    return data.Items[0] || null;
  } catch (err) {
    throw { status: 500, message: "Error retrieving user by username" };
  }
};

module.exports = {
  getUserByEmail,
  getUserByUsername,
};
