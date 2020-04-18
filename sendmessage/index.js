const response = require('./src/response');
const main = require('./src/app');

exports.handler = async event => {
    try {
        await main(event);
    } catch (e) {
        return response(500, e.stack);
    }
    return response(200, 'Data sent.');
};
