const apiGatewaySend = require('../driver/apiGatewaySend');

module.exports = async (apigwClient, myConnectionId, postData, role) => {
    const token = postData.token;
    const params = {
        TableName: 'workmode_users',
        Key: {
            token,
        }
    };
    let connectionData;
    try {
        connectionData = await ddbClient.scan(params).promise();
    } catch (err) {
        return [err]
    }

    console.log(connectionData.Items)
    const isLogined = connectionData.Items.length !== 0;
    const data = {
        role,
        isLogined,
    };
    return await apiGatewaySend(apigwClient, myConnectionId, data);
}