const ddbClient = require('../driver/ddb');
var uniqid = require('uniqid');
var jwt = require("jsonwebtoken");

const createToken = (id, SECRET_KEY) => {
    try {
        const expiresIn = 24 * 60 * 60 * 1000;
        const token = jwt.sign({ id }, SECRET_KEY, { expiresIn });
        return [token, null]
    } catch (err) {
        return ['', err]
    }
}

module.exports.create = async (name) => {
    const id = uniqid();
    const SECRET_KEY = process.env.SECRET_KEY;
    const [token, err] = createToken(id, SECRET_KEY);
    if (err !== null) return ['', '', err];

    const TableName = 'workmode_users'
    const putParams = {
        TableName,
        Item: {
            id,
            token,
            name,
        }
    };
    try {
        await ddbClient.put(putParams).promise();
    } catch (err) {
        return ['', '', err]
    }

    return [id, token, null]
}