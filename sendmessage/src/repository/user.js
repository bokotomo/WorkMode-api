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

// [TODO] ビジネスロジックの分離。でもそこまでやるなら静的言語でやりたい。テーブル単位でモジュール分けたい。
module.exports.create = async (name, connectionId) => {
    const id = uniqid();
    const SECRET_KEY = process.env.SECRET_KEY;
    const [token, err] = createToken(id, SECRET_KEY);
    if (err !== null) return ['', '', err];

    const putParamsToken = {
        TableName: 'workmode_token',
        Item: {
            token,
            id,
        }
    };
    try {
        await ddbClient.put(putParamsToken).promise();
    } catch (err) {
        return ['', '', err]
    }

    const putParams = {
        TableName: 'workmode_users',
        Item: {
            id,
            name,
            connectionId,
        }
    };
    try {
        await ddbClient.put(putParams).promise();
    } catch (err) {
        return ['', '', err]
    }

    return [id, token, null]
}


module.exports.activerUserSearch = async () => {
    const params = {
        TableName: 'workmode_connections',
    };
    let connectionData;
    try {
        connectionData = await ddbClient.scan(params).promise();
    } catch (err) {
        return [[], err]
    }
    let connectionIds = [];
    connectionData.Items.map(({ connectionId }) => {
        connectionIds.push(connectionId);
    });

    // [TODO] 分割
    const paramsUser = {
        TableName: 'workmode_users',
    };
    let userData;
    try {
        userData = await ddbClient.scan(paramsUser).promise();
    } catch (err) {
        return [[], err]
    }
    let users = [];
    connectionData.Items.map(({ id, name }) => {
        if (!connectionIds.includes(id)) continue;
        users.push({
            id,
            name,
        });
    });

    return [users, null]
}