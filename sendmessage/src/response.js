const apiGatewaySend = require('./driver/apiGatewaySend');

module.exports = async (apigwClient, myConnectionId, statusCode, body) => {
    if (statusCode === 500) {
        const data = {
            role: 'error',
            body,
        };
        await apiGatewaySend(apigwClient, myConnectionId, data);
    }
    return { statusCode, body };
}