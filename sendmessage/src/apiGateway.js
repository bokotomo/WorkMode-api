const AWS = require('aws-sdk');
const apiVersion = '2018-11-29';

module.exports = endpoint => {
    return new AWS.ApiGatewayManagementApi({
        apiVersion,
        endpoint,
    });
}