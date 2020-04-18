const ddbClient = require('../ddb');
const apiGatewaySend = require('../apiGatewaySend');

module.exports.create = async (apigwClient, myConnectionId, postData, role) => {
    const name = postData.name;
    const id = 'iidd'
    const token = 'otokkken'
    const data = {
        role,
        id,
        name,
        token,
    };
    try {
        await apiGatewaySend(apigwClient, myConnectionId, data);
    } catch (e) {
        throw e;
    }
}