const routing = require('./routing');

module.exports = async (event, apigwClient, myConnectionId) => {
  const postData = JSON.parse(event.body).data;
  return await routing(apigwClient, myConnectionId, postData);
};
