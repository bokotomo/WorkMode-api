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
    if (err !== null) return ['', '', '', err];

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
        return ['', '', '', err]
    }

    const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    const putParams = {
        TableName: 'workmode_users',
        Item: {
            id,
            name,
            connectionId,
            color,
        }
    };
    try {
        await ddbClient.put(putParams).promise();
    } catch (err) {
        return ['', '', '', err]
    }

    return [id, token, color, null]
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
    const userIds = connectionData.Items.map(({ id }) => id);

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
    const users = userData.Items
        .filter(({ id }) => userIds.includes(id))
    // .map(({ id, name }) => {
    //     return { id, name }
    // })

    return [users, null]
}

module.exports.update = async (connectionId, id) => {
    var params = {
        TableName: 'workmode_users',
        Key: {
            id,
        },
        UpdateExpression: "set connectionId = :connectionId",
        ExpressionAttributeValues: {
            ":connectionId": connectionId,
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        await ddbClient.update(params, (err, data) => {
            if (err) throw err;
        }).promise();
    } catch (err) {
        return [err]
    }

    return [null]
}