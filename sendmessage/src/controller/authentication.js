const apiGatewaySend = require('./apiGatewaySend');

module.exports = async (apigwClient, myConnectionId, postData) => {
    const data = {
        name: "OK",
    };
    try {
        await apiGatewaySend(apigwClient, myConnectionId, data);
    } catch (e) {
        throw e;
    }
}