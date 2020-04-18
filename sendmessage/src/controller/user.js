const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryUser = require('../repository/user');

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