const ddbClient = require('../driver/ddb');

module.exports.index = async (connectionId, userID) => {
  const data = {
    id: 'tomo',
    userName: '',
    userColor: '',
    text: '',
    progress: '',
    status: '',
    createdAt: '',
  };
  return [data, null];
};
