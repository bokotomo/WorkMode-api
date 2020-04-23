const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryTask = require('../repository/task');
const repositoryAuthentication = require('../repository/authentication');
const repositoryMessage = require('../repository/message');
const repositoryUser = require('../repository/user');

// トランザクションつける
module.exports.create = async (apigwClient, myConnectionId, postData, role) => {
  const token = postData.token;
  const [isLogined, userID, err] = await repositoryAuthentication(token);
  if (err !== null) return [err];
  if (!isLogined) return [new Error('not login')];

  const task = postData.task;
  const [taskTodos, errCreate] = await repositoryTask.add(userID, task);
  if (errCreate !== null) return [errCreate];

  const data = {
    role,
    taskTodos,
  };
  return await apiGatewaySend(apigwClient, myConnectionId, data);
};

module.exports.index = async (apigwClient, myConnectionId, postData, role) => {
  const token = postData.token;
  const [isLogined, userID, err] = await repositoryAuthentication(token);
  if (err !== null) return [err];
  if (!isLogined) return [new Error('not login')];

  const [
    todoList,
    inprogressList,
    doneList,
    errSearch,
  ] = await repositoryTask.index(userID);
  if (errSearch !== null) return [errSearch];

  const data = {
    role,
    todoList,
    inprogressList,
    doneList,
  };
  return await apiGatewaySend(apigwClient, myConnectionId, data);
};

module.exports.updateStatus = async (
  apigwClient,
  myConnectionId,
  postData,
  role
) => {
  const token = postData.token;
  const [isLogined, userID, err] = await repositoryAuthentication(token);
  if (err !== null) return [err];
  if (!isLogined) return [new Error('not login')];

  const taskID = postData.taskId;
  const status = postData.status;
  // ステータス変更
  const [errUpdateStatus] = await repositoryTask.updateStatus(
    userID,
    taskID,
    status
  );
  if (errUpdateStatus !== null) return [errUpdateStatus];

  const data = {
    role,
    success: true,
  };
  const [errSendUpdateStatus] = await apiGatewaySend(
    apigwClient,
    myConnectionId,
    data
  );
  if (errSendUpdateStatus !== null) return [errSendUpdateStatus];

  if (status !== 'inprogress' && status !== 'done') return [null];

  // メッセージ追加
  const groupID = postData.groupId || 'id1';
  const [addedMessage, errMessages] = await repositoryMessage.add(
    groupID,
    userID,
    taskID,
    status
  );
  if (errMessages !== null) return [errMessages];

  // 自分以外へ送信
  const [users, errSearch] = await repositoryUser.activerUserSearch();
  if (errSearch !== null) return [errSearch];

  const postCalls = users.map(async ({ connectionId, id }) => {
    const dataSearch = {
      role: 'message_progress_added',
      message: addedMessage,
    };
    const [errActiveUser] = await apiGatewaySend(
      apigwClient,
      connectionId,
      dataSearch
    );
    if (errActiveUser !== null) throw errActiveUser;
  });
  try {
    await Promise.all(postCalls);
  } catch (err) {
    return [err];
  }

  return [null];
};

module.exports.delete = async (apigwClient, myConnectionId, postData, role) => {
  const token = postData.token;
  const [isLogined, userID, err] = await repositoryAuthentication(token);
  if (err !== null) return [err];
  if (!isLogined) return [new Error('not login')];

  const taskID = postData.taskId;
  const [errDelete] = await repositoryTask.delete(userID, taskID);
  if (errDelete !== null) return [errDelete];

  const data = {
    role,
    success: true,
  };
  return await apiGatewaySend(apigwClient, myConnectionId, data);
};
