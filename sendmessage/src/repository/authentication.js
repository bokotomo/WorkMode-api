const ddbClient = require('../driver/ddb');

module.exports = async (token) => {
    const params = {
        TableName: 'workmode_token',
        KeyConditionExpression: "#key = :val",
        ExpressionAttributeValues: {
            ":val": token
        },
        ExpressionAttributeNames: {
            "#key": "token"
        },
    };
    let isLogined = false;
    let id = '';
    try {
        await ddbClient.query(params, (err, data) => {
            if (err) throw err;
            if (data.Count === 1) {
                isLogined = true;
                id = data.Items[0].id;
            }
        }).promise();
    } catch (err) {
        return [false, '', err]
    }

    return [isLogined, id, null]
}