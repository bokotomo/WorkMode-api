const ddbClient = require('../driver/ddb');
var uniqid = require('uniqid');

const updateTasks = async (userID, domainTasks) => {
  var params = {
    TableName: 'workmode_tasks',
    Key: {
      userId: userID,
    },
    UpdateExpression: 'set tasks = :tasks',
    ExpressionAttributeValues: {
      ':tasks': domainTasks,
    },
    ReturnValues: 'UPDATED_NEW',
  };
  try {
    await ddbClient
      .update(params, (err, data) => {
        if (err) throw err;
      })
      .promise();
  } catch (err) {
    return [err];
  }

  return [null];
};

module.exports.create = async (userID, task) => {
  const id = uniqid();
  const domainTask = {
    ...task,
    id,
  };
  const tasks = [domainTask];
  const putParams = {
    TableName: 'workmode_tasks',
    Item: {
      userId: userID,
      tasks,
    },
  };
  try {
    await ddbClient.put(putParams).promise();
  } catch (err) {
    return [[], err];
  }

  return [tasks, null];
};

module.exports.add = async (userID, task) => {
  const [
    todoList,
    inprogressList,
    doneList,
    errTasks,
  ] = await module.exports.index(userID);
  if (errTasks !== null) return [errTasks];
  const origintasks = [...todoList, ...inprogressList, ...doneList];

  // 空なら新規追加
  if (origintasks.length === 0) {
    const [domainTasks, errTaskCreate] = await module.exports.create(
      userID,
      task
    );
    if (errTaskCreate !== null) return [errTaskCreate];
    return [domainTasks, null];
  }

  // 空でないなら更新
  const id = uniqid();
  const domainTask = {
    ...task,
    id,
  };
  const domainTasks = [...origintasks, domainTask];
  const [errUpdateTask] = await updateTasks(userID, domainTasks);
  if (errUpdateTask !== null) return [[], errUpdateTask];
  const domainTaskTodos = domainTasks.filter((task) => task.status === 'todo');

  return [domainTaskTodos, null];
};

// DynamoだときついからRDBにしたいでもお金かかるからしばらくDynamo
module.exports.getAll = async () => {
  const params = {
    TableName: 'workmode_tasks',
  };
  let data;
  try {
    data = await ddbClient.scan(params).promise();
  } catch (err) {
    return [[], err];
  }
  const tasks = data.Items;
  return [tasks, null];
};

module.exports.index = async (userID) => {
  const params = {
    TableName: 'workmode_tasks',
    KeyConditionExpression: '#key = :val',
    ExpressionAttributeValues: {
      ':val': userID,
    },
    ExpressionAttributeNames: {
      '#key': 'userId',
    },
  };
  let tasks = [];
  try {
    await ddbClient
      .query(params, (err, data) => {
        if (err) throw err;
        if (data.Count !== 0) {
          isLogined = true;
          tasks = data.Items[0].tasks;
        }
      })
      .promise();
  } catch (err) {
    return [[], [], [], err];
  }
  const todoList = tasks.filter((task) => task.status === 'todo');
  const inprogressList = tasks.filter((task) => task.status === 'inprogress');
  const doneList = tasks.filter((task) => task.status === 'done');

  return [todoList, inprogressList, doneList, null];
};

module.exports.updateStatus = async (userID, taskID, status) => {
  const [
    todoList,
    inprogressList,
    doneList,
    errTasks,
  ] = await module.exports.index(userID);
  if (errTasks !== null) return [errTasks];
  const origintasks = [...todoList, ...inprogressList, ...doneList];

  const domainTasks = origintasks.map((task) => {
    if (task.id === taskID) task.status = status;
    return task;
  });

  return await updateTasks(userID, domainTasks);
};

module.exports.delete = async (userID, taskID) => {
  const [
    todoList,
    inprogressList,
    doneList,
    errTasks,
  ] = await module.exports.index(userID);
  if (errTasks !== null) return [errTasks];
  const origintasks = [...todoList, ...inprogressList, ...doneList];

  const domainTasks = origintasks.filter((task) => task.id !== taskID);

  return await updateTasks(userID, domainTasks);
};
