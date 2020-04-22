const apiGatewayAPI = require('./src/driver/apiGateway');
const main = require('./src/app');
const response = require('./src/response');

exports.handler = async (event) => {
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const endpoint = domainName + '/' + stage;
  const apigwClient = apiGatewayAPI(endpoint);
  const myConnectionId = event.requestContext.connectionId;
  const [err] = await main(event, apigwClient, myConnectionId);
  if (err !== null)
    return await response(apigwClient, myConnectionId, 500, err.stack);
  return await response(apigwClient, myConnectionId, 200, 'Data sent.');
};
