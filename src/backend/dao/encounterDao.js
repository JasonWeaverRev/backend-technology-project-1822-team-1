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
  BatchGetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

const documentClient = DynamoDBDocumentClient.from(client);

const TableName = "Encounters";

const getEncounterById = async (encounter_id) => {
  try {
    const command = new GetCommand({
      TableName,
      Key: { encounter_id },
    });

    const data = await documentClient.send(command);

    return data.Item || null;
  } catch (err) {
    console.log(err);
    throw { status: 500, message: "Error retrieving encounter by id" };
  }
};

const createEncounter = async (encounter) => {
  try {
    const command = new PutCommand({
      TableName,
      Item: encounter,
    });

    await documentClient.send(command);
  } catch (err) {
    throw { status: 500, message: "Error creating new encounter" };
  }
};

const getEncountersByUsername = async (username) => {
  try {
    const command = new QueryCommand({
      TableName,
      IndexName: "encounters_by_username-index",
      KeyConditionExpression: "#created_by = :username",
      ExpressionAttributeNames: {
        "#created_by": "created_by",
      },
      ExpressionAttributeValues: {
        ":username": { S: username },
      },
    });

    const data = await documentClient.send(command);

    const processedItems = data.Items.map((item) => unmarshall(item));

    return processedItems || [];
  } catch (err) {
    console.error(err);
    throw { status: 500, message: "Error retrieving encounters by username" };
  }
};

// const getEncountersByUsername = async (username) => {
//   try {
//     const command = new QueryCommand({
//       TableName,
//       IndexName: "encounters_by_username-index",
//       KeyConditionExpression: "created_by = :username",
//       ExpressionAttributeValues: {
//         ":username": username,
//       },
//     });

//     const data = await client.send(command);
//     console.log(data.Items);
//     return data.Items;
//   } catch (err) {
//     throw { status: 500, message: "Error retrieving encounters by username" };
//   }
// };

const getBatchEncountersbyId = async (encounter_ids) => {
  try {
    const batchGetCommand = new BatchGetCommand({
      RequestItems: {
        [TableName]: {
          Keys: encounter_ids.map((encounterId) => ({
            encounter_id: encounterId,
          })),
        },
      },
    });

    const batchResponse = await documentClient.send(batchGetCommand);

    batchResponse.Responses[TableName].forEach((idx) => {
      idx.monsters = JSON.parse(idx.monsters);
    });

    return batchResponse.Responses[TableName] || [];
  } catch (err) {
    console.error(err);
    throw { status: 500, message: "Error retrieving encounters in batch" };
  }
};

// assigns a campaign_title to an Encounter -- used if we only want 1 campaign per encounter
const createCampaign = async (encounter_id, campaign_title) => {
  try {
    const command = new UpdateCommand({
      TableName,
      Key: {encounter_id},
      UpdateExpression: 'SET campaign_title = :campaign_title',
      ExpressionAttributeValues: {
        ':campaign_title': campaign_title
      },
      /* IF WE WANT TO ALLOW 1 ENCOUNTER TO BE ADDED TO MULTIPLE CAMPAIGNS (campaign_title would be a list)
        UpdateExpression: 'SET campaign_title = list_append(if_not_exists(campaign_title, :empty_list), :campaign_title)',
        ExpressionAttributeValues: {
        ':campaign_title': [campaign_title],
        ':empty_list': []
      },
      */
      ReturnValues: "ALL_NEW"
    })

    const data = await documentClient.send(command);
    return data;

  } catch (err) {
    throw { status: 500, message: "Error assigning campaign_title to encounter" };
  }
}

// removes campaign_title assignment to an encounter -- used if we only want 1 campaign per encounter
const removeCampaign = async (encounter_id) => {
  try {
    let empty = "";
    const command = new UpdateCommand({
      TableName,
      Key: {encounter_id},
      UpdateExpression: 'SET campaign_title = :empty',
      ExpressionAttributeValues: {
        ':empty': empty
      },
      ReturnValues: "ALL_NEW"
    })

    const data = await documentClient.send(command);
    return data;
    
  } catch (err) {
    throw { status: 500, message: "Internal server error" };
  }
}

/* IF WE WANT TO ALLOW 1 ENCOUNTER TO BE ADDED TO MULTIPLE CAMPAIGNS (campaign_title would be a list)
async function removeCampaign(encounter_id, index) {
    const command = new UpdateCommand({
        TableName,
        Key: { encounter_id },
        UpdateExpression: `REMOVE campaign_title[${index}]`,
        ReturnValues: "ALL_NEW"
    });

    try {
        const data = await documentClient.send(command);
        return data;
    } catch (err) {
        throw { status: 500, message: "Error removing campaign_title" };
    }
}
*/

module.exports = {
  getEncounterById,
  getBatchEncountersbyId,
  createEncounter,
  getEncountersByUsername,
  createCampaign,
  removeCampaign
};
