const ddbClient = require('../driver/ddb');

module.exports.update = async (connectionId, userID) => {
  var params = {
    TableName: 'workmode_connections',
    Key: {
      connectionId,
    },
    UpdateExpression: 'set id = :id',
    ExpressionAttributeValues: {
      ':id': userID,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    await ddbClient
      .update(params, (err, data) => {
        if (err) throw err;
      })
      .promise();
  } catch (err) {
    return [err];
  }

  return [null];
};
