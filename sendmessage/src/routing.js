const controllerAuthentication = require('./controller/authentication');
const controllerUser = require('./controller/user');
const controllerTask = require('./controller/task');

module.exports = async (apigwClient, myConnectionId, postData) => {
  switch (postData.role) {
    case 'authentication': {
      const [err] = await controllerAuthentication(
        apigwClient,
        myConnectionId,
        postData,
        'authentication'
      );
      if (err !== null) return [err];
      break;
    }
    case 'user_create': {
      const [err] = await controllerUser.create(
        apigwClient,
        myConnectionId,
        postData,
        'user_create'
      );
      if (err !== null) return [err];
      break;
    }
    case 'active_user_search': {
      const [err] = await controllerUser.activeUserSearch(
        apigwClient,
        myConnectionId,
        postData,
        'active_user_search'
      );
      if (err !== null) return [err];
      break;
    }
    case 'task_create': {
      const [err] = await controllerTask.create(
        apigwClient,
        myConnectionId,
        postData,
        'task_create'
      );
      if (err !== null) return [err];
      break;
    }
    case 'task_update_status': {
      const [err] = await controllerTask.updateStatus(
        apigwClient,
        myConnectionId,
        postData,
        'task_update_status'
      );
      if (err !== null) return [err];
      break;
    }
    case 'task_delete': {
      const [err] = await controllerTask.delete(
        apigwClient,
        myConnectionId,
        postData,
        'task_delete'
      );
      if (err !== null) return [err];
      break;
    }
    case 'task_index': {
      const [err] = await controllerTask.index(
        apigwClient,
        myConnectionId,
        postData,
        'task_index'
      );
      if (err !== null) return [err];
      break;
    }
    default:
      return [new Error('存在しないリクエストです。' + postData.role)];
  }

  return [null];
};
