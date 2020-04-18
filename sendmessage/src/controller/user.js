const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryUser = require('../repository/user');

module.exports.create = async (apigwClient, myConnectionId, postData, role) => {
    const name = postData.name;
    const res = repositoryUser.create(name)
    const data = {
        role,
        id: res.id,
        name,
        token: res.token,
    };
    try {
        await apiGatewaySend(apigwClient, myConnectionId, data);
    } catch (e) {
        throw e;
    }
}