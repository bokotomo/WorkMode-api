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
    const [tasks, errCreate] = await repositoryTask.add(userID, task);
    if (errCreate !== null) return [errCreate]

    const data = {
        role,
        tasks,
    };
    return await apiGatewaySend(apigwClient, myConnectionId, data);
}

module.exports.index = async (apigwClient, myConnectionId, postData, role) => {
    const token = postData.token;
    const [isLogined, userID, err] = await repositoryAuthentication(token);
    if (err !== null) return [err]
    if (!isLogined) return [new Error('not login')]

    const [todoList, inprogressList, doneList, errSearch] = await repositoryTask.index(userID);
    if (errSearch !== null) return [errSearch]

    const data = {
        role,
        todoList,
        inprogressList,
        doneList,
    };
    return await apiGatewaySend(apigwClient, myConnectionId, data);
}