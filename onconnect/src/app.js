const statusCode = require('./statusCode');
const response = require('./response');
const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient(
  {
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION,
  }
);

exports.handler = async event => {
  const putParams = {
    TableName: process.env.TABLE_NAME,
    Item: {
      connectionId: event.requestContext.connectionId
    }
  };

  try {
    await ddb.put(putParams).promise();
  } catch (err) {
    return response(statusCode.bad, 'Failed to connect: ' + JSON.stringify(err));
  }

  return response(statusCode.success, 'Connected.');
};
