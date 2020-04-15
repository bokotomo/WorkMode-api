const response = require('./response');
const ddbClient = require('./ddb');
const apiGatewayAPI = require('./apiGateway');
const controllerAuthentication = require('./controller/authentication');

const routing = async (apigwClient, myConnectionId, postData) => {
  switch (postData.role) {
    case 'authentication':
      try {
        await controllerAuthentication(apigwClient, myConnectionId, postData);
      } catch (e) {
        throw e;
      }
      break;
    case 'tokomo':
      break;
    default:
      throw new Error('not found routing');
  }
}

const main = async event => {
  const postData = JSON.parse(event.body).data;
  const endpoint = event.requestContext.domainName + '/' + event.requestContext.stage;
  const apigwClient = apiGatewayAPI(endpoint);
  const myConnectionId = event.requestContext.connectionId;

  try {
    await routing(apigwClient, myConnectionId, postData);
  } catch (e) {
    throw e;
  }
}

exports.handler = async event => {
  try {
    await main(event);
  } catch (e) {
    return response(500, e.stack);
  }
  return response(200, 'Data sent.');
};
