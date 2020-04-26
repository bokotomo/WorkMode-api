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

  // ステータス変更の完了を通知する
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

  // TODOタスクはメッセージに追加しない
  if (status === 'todo') return [null];

  // メッセージをDBへ追加
  const groupID = postData.groupId || 'id1';
  const [addedMessage, errMessages] = await repositoryMessage.add(
    groupID,
    userID,
    taskID,
    status
  );
  if (errMessages !== null) return [errMessages];

  // 自分以外へ送信
  const [connectionUsers, errSearch] = await repositoryUser.activerUserSearch();
  if (errSearch !== null) return [errSearch];

  const postCalls = connectionUsers.map(async ({ connectionId }) => {
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

  // タスクの削除
  const taskID = postData.taskId;
  const [errDelete] = await repositoryTask.delete(userID, taskID);
  if (errDelete !== null) return [errDelete];

  // メッセージの削除
  const groupID = postData.groupId || 'id1';
  const [
    deletedMessages,
    errDeleteMessage,
  ] = await repositoryMessage.deleteByTaskID(groupID, taskID);
  if (errDeleteMessage !== null) return [errDeleteMessage];

  const data = {
    role,
    success: true,
  };
  const [errDeleteSend] = await apiGatewaySend(
    apigwClient,
    myConnectionId,
    data
  );
  if (errDeleteSend !== null) return [errDeleteSend];

  // 全員へ送信
  const [connectionUsers, errSearch] = await repositoryUser.activerUserSearch();
  if (errSearch !== null) return [errSearch];

  const postCalls = connectionUsers.map(async ({ connectionId }) => {
    const dataSearch = {
      role: 'message_progress_deleted',
      messages: deletedMessages,
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

module.exports.update = async (apigwClient, myConnectionId, postData, role) => {
  const token = postData.token;
  const [isLogined, userID, err] = await repositoryAuthentication(token);
  if (err !== null) return [err];
  if (!isLogined) return [new Error('not login')];

  // タスクの更新
  const task = postData.task;
  const [errUpdate] = await repositoryTask.update(userID, task);
  if (errUpdate !== null) return [errUpdate];

  return [null];
};
