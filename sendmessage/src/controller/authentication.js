const apiGatewaySend = require('../driver/apiGatewaySend');

module.exports = async (apigwClient, myConnectionId, postData, role) => {
    const token = postData.token;
    const isLogined = token === 'otokkken'
    const data = {
        role,
        isLogined,
    };

    return await apiGatewaySend(apigwClient, myConnectionId, data);
}