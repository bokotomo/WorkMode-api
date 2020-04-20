const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryUser = require('../repository/user');
const repositoryAuthentication = require('../repository/authentication');
const repositoryConnection = require('../repository/connection');

// トランザクションつける
module.exports.create = async (apigwClient, myConnectionId, postData, role) => {
    const name = postData.name;
    const [userID, token, color, err] = await repositoryUser.create(name, myConnectionId)
    if (err !== null) return [err]

    // コネクションにID紐づける
    const [errConnection] = await repositoryConnection.update(myConnectionId, userID);
    if (errConnection !== null) return [errConnection]

    // 自分へ登録完了を通知
    const data = {
        role,
        id: userID,
        name,
        color,
        token,
    };
    const [errSend] = await apiGatewaySend(apigwClient, myConnectionId, data);
    if (errSend !== null) return [errSend]

    // 全員へ通知
    const [users, errSearch] = await repositoryUser.activerUserSearch()
    if (errSearch !== null) return [errSearch]
    users.forEach(async ({ connectionId }) => {
        const data = {
            role: 'active_user_search',
            users,
        };
        const [errActiveUser] = await apiGatewaySend(apigwClient, connectionId, data);
        if (errActiveUser !== null) return [errConnection]
    });

    return [null]
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
