const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryUser = require('../repository/user');
const repositoryAuthentication = require('../repository/authentication');

module.exports.create = async (apigwClient, myConnectionId, postData, role) => {
    const name = postData.name;
    const [id, token, err] = await repositoryUser.create(name, myConnectionId)
    if (err !== null) return [err]

    const data = {
        role,
        id,
        name,
        token,
    };
    return await apiGatewaySend(apigwClient, myConnectionId, data);
}

module.exports.activeUserSearch = async (apigwClient, myConnectionId, postData, role) => {
    const token = postData.token;
    const [isLogined, userID, err] = await repositoryAuthentication(token);
    if (err !== null) return [err]
    if (!isLogined) return [new Error('not login')]

    const [users, errSearch] = await repositoryUser.activerUserSearch()
    if (errSearch !== null) return [errSearch]

    const data = {
        role,
        users,
    };
    return await apiGatewaySend(apigwClient, myConnectionId, data);
}