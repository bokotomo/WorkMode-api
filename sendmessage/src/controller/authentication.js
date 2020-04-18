const ddbClient = require('../ddb');
const apiGatewaySend = require('../apiGatewaySend');

module.exports = async (apigwClient, myConnectionId, postData, role) => {
    const token = postData.token;
    const isLogined = token === 'otokkken'
    const data = {
        role,
        isLogined,
    };
    try {
        await apiGatewaySend(apigwClient, myConnectionId, data);
    } catch (e) {
        throw e;
    }
}