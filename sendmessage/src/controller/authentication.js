const apiGatewaySend = require('../driver/apiGatewaySend');
const repositoryAuthentication = require('../repository/authentication');
const repositoryConnection = require('../repository/connection');
const repositoryUser = require('../repository/user');
const repositoryTask = require('../repository/task');
const repositoryMessage = require('../repository/message');

// [TODO] 関数にしサービスにまとめる
module.exports.signin = async (apigwClient, myConnectionId, postData, role) => {
  const token = postData.token;
};

module.exports.authentication = async (
  apigwClient,
  myConnectionId,
  postData,
  role
) => {
  const token = postData.token;
  const [isLogined, userID, err] = await repositoryAuthentication(token);
  if (err !== null) return [err];

  // 自身へログイン結果を通知
  const data = {
    role,
    isLogined,
    id: userID,
  };
  const [errSend] = await apiGatewaySend(apigwClient, myConnectionId, data);
  if (errSend !== null) return [errSend];
  if (!isLogined) return [null];

  // 自身へタスク一覧を送信
  const [
    todoList,
    inprogressList,
    doneList,
    errTasks,
  ] = await repositoryTask.index(userID);
  if (errTasks !== null) return [errTasks];
  const dataTasks = {
    role: 'task_index',
    todoList,
    inprogressList,
    doneList,
  };
  const [errSendTasks] = await apiGatewaySend(
    apigwClient,
    myConnectionId,
    dataTasks
  );
  if (errSendTasks !== null) return [errSendTasks];

  // 自身へタスク進捗メッセージ一覧を返す
  const groupID = 'id1';
  const [messages, errMessages] = await repositoryMessage.index(groupID);
  if (errMessages !== null) return [errMessages];
  const dataMessages = {
    role: 'message_progress_index',
    messages,
  };
  const [errSendMessages] = await apiGatewaySend(
    apigwClient,
    myConnectionId,
    dataMessages
  );
  if (errSendMessages !== null) return [errSendMessages];

  // コネクションのユーザID更新
  const [errConnection] = await repositoryConnection.update(
    myConnectionId,
    userID
  );
  if (errConnection !== null) return [errConnection];

  // ユーザのコネクションIDの更新
  const [errUser] = await repositoryUser.update(myConnectionId, userID);
  if (errUser !== null) return [errUser];

  // ログインしたユーザを全員へ通知
  const [users, errSearch] = await repositoryUser.activerUserSearch();
  if (errSearch !== null) return [errSearch];

  // 全員へアクティブなユーザを通知
  const postCalls = users.map(async ({ connectionId, id }) => {
    const sortedUsers = [
      ...users.filter((user) => user.id === id),
      ...users.filter((user) => user.id !== id),
    ];
    const dataSearch = {
      role: 'active_user_search',
      users: sortedUsers,
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
