const apiGatewayAPI = require('./driver/apiGateway');
const controllerAuthentication = require('./controller/authentication');
const controllerUser = require('./controller/user');

const routing = async (apigwClient, myConnectionId, postData) => {
  switch (postData.role) {
    case 'authentication':
      {
        const [err] = await controllerAuthentication(apigwClient, myConnectionId, postData, 'authentication');
        if (err !== null) return [err]
      }
      break;
    case 'user_create':
      {
        const [err] = await controllerUser.create(apigwClient, myConnectionId, postData, 'user_create');
        if (err !== null) return [err]
      }
      break;
    default:
      return [new Error('not found routing')]
  }

  return [null]
}

module.exports = async event => {
  const postData = JSON.parse(event.body).data;
  const endpoint = event.requestContext.domainName + '/' + event.requestContext.stage;
  const apigwClient = apiGatewayAPI(endpoint);
  const myConnectionId = event.requestContext.connectionId;

  return await routing(apigwClient, myConnectionId, postData);
}
