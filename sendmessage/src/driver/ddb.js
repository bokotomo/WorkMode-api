const AWS = require('aws-sdk');
const apiVersion = '2012-08-10';

module.exports = new AWS.DynamoDB.DocumentClient({
  apiVersion,
  region: process.env.AWS_REGION,
});
