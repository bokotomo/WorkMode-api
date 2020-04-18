const response = require('./src/response');
const main = require('./src/app');

exports.handler = async event => {
    const [err] = await main(event);
    if (err !== null) return response(500, err.stack);
    return response(200, 'Data sent.');
};
