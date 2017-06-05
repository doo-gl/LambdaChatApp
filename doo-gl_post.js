'use strict';

console.log('Loading function');

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const uuidV4 = require('uuid/v4');

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

    // extract the ip address from the request sent by amazon
    const identity = event.requestContext.identity;
    const ipAddress = identity.sourceIp;
    const date_created = new Date().getTime().toString();


    const body = JSON.parse(event.body);
    const user = body.user;
    const message = body.message;


    // Call dynamo db to store our message
    dynamodb.putItem({
            // dynamo knows where to store the message
            // because tableNames are global within an AWS region
            "TableName": tableName,
            // The item row to store.
            "Item": {
                "hash_id": {"S": hash_id},
                "date_created": {"S": date_created},
                "user" : {"S": user},
                "message": {"S": message},
                "ip_address" : {"S": ipAddress}
            }
        },
        function (err, data) {

            if (err) {
                var responseData = JSON.stringify(err);
                console.log('Failed to put item: ' + responseData);
                returnResponse('500', responseData);
            } else {
                var responseData = JSON.stringify(data);
                console.log('Put Item: ' + responseData);
                returnResponse('200', responseData);
            }

        }
    );


}
;