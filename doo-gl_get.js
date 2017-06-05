'use strict';

console.log('Loading function');

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

exports.handler = function (event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // define a function that takes a status and a json object
    // and calls amazon's api to retuen it as the HTTP response
    var returnResponse = function (status, response) {
        callback(
            null,
            {
                statusCode: status,
                body: JSON.stringify(response),
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*", // required for aws cors integration
                },
            }
        );
    };

    // read the table name that data will be stored in
    const tableName = process.env.TABLE_NAME;
    // in this instance the hash_id is basically acting as a chat room
    const hash_id = 'General_Chat';

    // Call DynamoDB to get the messages
    dynamodb.query({
            // dynamo knows where to store the message
            // because tableNames are global within an AWS region
            "TableName": tableName,
            // Get messages that have a particular hash_id
            "ExpressionAttributeValues": {
                ":hash_id": {
                    S: hash_id
                }
            },
            "KeyConditionExpression": "hash_id = :hash_id",
            // This orders by results DESC (so they are in most recent time order)
            "ScanIndexForward" : false,
            // Returns the last 30 results
            "Limit" : 30
        },
        function (err, data) {

            if (err) {
                var responseData = err;
                console.log('Failed to get item: ' + JSON.stringify(responseData));
                returnResponse('500', responseData);
            } else {
                var responseData = data;
                console.log('Get Item: ' + JSON.stringify(responseData));
                returnResponse('200', responseData);
            }

        }
    );
};