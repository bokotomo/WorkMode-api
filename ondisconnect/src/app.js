const response = require('./response');
const ddbClient = require('./ddb');

// コネクションを切る時
// KVSの自身のコネクションIDを削除する。
exports.handler = async event => {
  const deleteParams = {
    TableName: process.env.TABLE_NAME,
    Key: {
      connectionId: event.requestContext.connectionId
    }
  };

  try {
    await ddbClient.delete(deleteParams).promise();
  } catch (err) {
    return response(500, 'Failed to disconnect: ' + JSON.stringify(err));
  }

  // 全員へアクティブなユーザを通知
  const postCalls = users.map(async ({ connectionId }) => {
    const dataSearch = {
      role: 'active_user_search',
      users,
    };
    const [errActiveUser] = await apiGatewaySend(apigwClient, connectionId, dataSearch);
    if (errActiveUser !== null) throw errConnection
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    return [e]
  }

  return response(200, 'Disconnected.');
};