const ddbClient = require('../driver/ddb');
const repositoryUser = require('../repository/user');
const repositoryTask = require('../repository/task');
const uniqid = require('uniqid');
const moment = require('moment');

module.exports.get = async (groupID) => {
  const params = {
    TableName: 'workmode_message_progress',
    KeyConditionExpression: '#key = :val',
    ExpressionAttributeValues: {
      ':val': groupID,
    },
    ExpressionAttributeNames: {
      '#key': 'groupId',
    },
  };
  let messages = [];
  try {
    await ddbClient
      .query(params, (err, data) => {
        if (err) throw err;
        if (data.Count !== 0) {
          messages = data.Items[0].messages;
        }
      })
      .promise();
  } catch (err) {
    return [[], err];
  }

  return [messages, null];
};

module.exports.index = async (groupID) => {
  const [messages, errMessages] = await module.exports.get(groupID);
  if (errMessages !== null) return [[], errMessages];

  // 全てのタスクの取得
  const [tasks, errTaskSearch] = await repositoryTask.getAll();
  if (errTaskSearch !== null) return [[], errTaskSearch];

  // 全てのユーザの取得
  const [users, errUserSearch] = await repositoryUser.getAll();
  if (errUserSearch !== null) return [[], errUserSearch];

  const responseMessages = messages.map((message) => {
    const targetUser = users.find((user) => user.id === message.userId);
    const targetTaskDetail = tasks.find(
      (task) => task.userId === message.userId
    );
    const targetTask = targetTaskDetail.tasks.find(
      (task) => task.id === message.taskId
    );
    return {
      id: message.id,
      userName: targetUser.name,
      userColor: targetUser.color,
      text: targetTask.title,
      status: message.status,
      createdAt: message.createdAt,
    };
  });

  return [responseMessages, null];
};

module.exports.update = async (groupID, messages) => {
  const putParams = {
    TableName: 'workmode_message_progress',
    Item: {
      groupId: groupID,
      messages,
    },
  };
  try {
    await ddbClient.put(putParams).promise();
  } catch (err) {
    return [err];
  }
  return [null];
};

module.exports.add = async (groupID, userID, taskID, status) => {
  const [messages, err] = await module.exports.get(groupID);
  if (err !== null) return [err];

  const messageID = uniqid();
  const message = {
    id: messageID,
    userId: userID,
    taskId: taskID,
    status,
    createdAt: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
  };

  // 空なら新規追加
  if (messages.length === 0) {
    const domainMessages = [message];
    return await module.exports.update(groupID, domainMessages);
  }

  // あるなら追加
  const domainMessages = [...messages, message];
  return await module.exports.update(groupID, domainMessages);
};
