const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({region: "us-east-1"});
const documentClient = DynamoDBDocumentClient.from(client);
const TableName = "Encounter_Campaigns";

/*
    EncounterCampaign Object Model
        {
            campaign_id :   unique id, partition key
            campaign_title  :   string, required
            encounters  :   a List of encounter_id's
        }
*/

async function getCampaignById(campaign_id) {
    const command = new GetCommand({
        TableName,
        Key: {campaign_id}
    })

    try {
        const data = await documentClient.send(command);
        return data.Item || null;

    } catch (err) {
        console.error("Error fetching campaign by ID: ", err);
        return null;
    }
}

async function createNewCampaign(campaign) {
    const command = new PutCommand({
        TableName,
        Item: campaign
    })

    try {
        const data = await documentClient.send(command);
        return campaign;
    } catch (err) {
        console.error("Error creating new campaign: ", err);
        return null;
    }
}

async function addEncounterToCampaign(campaign_id, new_encounter) {
    const command = new UpdateCommand({
        TableName,
        Key: {campaign_id},
        UpdateExpression: 'SET encounters = list_append(encounters, :new_encounter)',
        ExpressionAttributeValues: {
            ':new_encounter': new_encounter
        },
        ReturnValues: 'CAMPAIGN ENCOUNTER UPDATED'
    })

    try {
        const data = await documentClient.send(command);
        return campaign;
    } catch (err) {
        console.error("Error adding encounter to campaign: ", err);
        return null;
    }
}