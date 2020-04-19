const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryTask = require('../repository/task');
const repositoryAuthentication = require('../repository/authentication');

// トランザクションつける
module.exports.create = async (apigwClient, myConnectionId, postData, role) => {
    const token = postData.token;
    const [isLogined, userID, err] = await repositoryAuthentication(token);
    if (err !== null) return [err]
    if (!isLogined) return [new Error('not login')]

    const task = postData.task;
    const [createdTask, errCreate] = await repositoryTask.create(userID, task);
    if (errCreate !== null) return [errCreate]

    const data = {
        role,
        task: createdTask,
    };
    return await apiGatewaySend(apigwClient, myConnectionId, data);
}