const ddbClient = require('./ddb');

module.exports = async (apigwClient, ConnectionId, data) => {
  try {
    await apigwClient
      .postToConnection({
        ConnectionId,
        Data: JSON.stringify(data),
      })
      .promise();
  } catch (err) {
    if (err.statusCode === 410) {
      console.log(`コネクションエラー, deleting ${ConnectionId}`);
      await ddbClient
        .delete({ TableName: 'workmode_connections', Key: { ConnectionId } })
        .promise();
    }
    return [err];
  }
  return [null];
};
