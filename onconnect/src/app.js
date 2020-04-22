const statusCode = require('./statusCode');
const response = require('./response');
const ddbClient = require('./ddb');

// コネクション確立時
// KVSへ自身のコネクションIDを保存する。
exports.handler = async (event) => {
  const putParams = {
    TableName: process.env.TABLE_NAME,
    Item: {
      connectionId: event.requestContext.connectionId,
    },
  };

  try {
    await ddbClient.put(putParams).promise();
  } catch (err) {
    return response(
      statusCode.bad,
      'Failed to connect: ' + JSON.stringify(err)
    );
  }

  return response(statusCode.success, 'Connected.');
};
