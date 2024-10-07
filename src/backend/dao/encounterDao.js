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

module.exports = { getEncounterById, getBatchEncountersbyId, createEncounter };
