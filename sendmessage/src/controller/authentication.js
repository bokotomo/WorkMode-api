const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryAuthentication = require('../repository/authentication');
const repositoryConnection = require('../repository/connection');

module.exports = async (apigwClient, myConnectionId, postData, role) => {
    const token = postData.token;
    const [isLogined, userID, err] = await repositoryAuthentication(token);
    if (err !== null) return [err]

    const [errConnection] = await repositoryConnection.update(myConnectionId, userID);
    if (errConnection !== null) return [errConnection]

    const data = {
        role,
        isLogined,
    };
    return await apiGatewaySend(apigwClient, myConnectionId, data);
}