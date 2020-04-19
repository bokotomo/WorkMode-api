const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryAuthentication = require('../repository/authentication');
const repositoryConnection = require('../repository/connection');
const repositoryUser = require('../repository/user');

module.exports = async (apigwClient, myConnectionId, postData, role) => {
    const token = postData.token;
    const [isLogined, userID, err] = await repositoryAuthentication(token);
    if (err !== null) return [err]

    // コネクションのユーザID更新
    const [errConnection] = await repositoryConnection.update(myConnectionId, userID);
    if (errConnection !== null) return [errConnection]

    // ユーザのコネクションIDの更新
    const [errUser] = await repositoryUser.update(myConnectionId, userID);
    if (errUser !== null) return [errUser]

    const data = {
        role,
        isLogined,
    };
    const [errSend] = await apiGatewaySend(apigwClient, myConnectionId, data);
    if (errSend !== null) return [errSend]
    if (!isLogined) return [null]

    // 全員へ通知
    const [users, errSearch] = await repositoryUser.activerUserSearch()
    if (errSearch !== null) return [errSearch]

    const postCalls = await users.map(async ({ connectionId }) => {
        const dataSearch = {
            role: 'active_user_search',
            users,
        };
        const [errActiveUser] = await apiGatewaySend(apigwClient, connectionId, dataSearch);
        if (errActiveUser !== null) throw errConnection
    });

    try {
        await Promise.all(postCalls);
    } catch (e) {
        return [e]
    }

    return [null]
}