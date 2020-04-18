const ddbClient = require('./ddb');
const { TABLE_NAME } = process.env;

module.exports = async (apigwClient, ConnectionId, data) => {
    try {
        await apigwClient.postToConnection({
            ConnectionId,
            Data: JSON.stringify(data)
        }).promise();
    } catch (err) {
        if (err.statusCode === 410) {
            console.log(`Found stale connection, deleting ${ConnectionId}`);
            await ddbClient.delete({ TableName: TABLE_NAME, Key: { ConnectionId } }).promise();
        } else {
            return [err]
        }
    }
    return [null]
}