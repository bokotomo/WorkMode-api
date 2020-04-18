const ddbClient = require('../driver/ddb');

module.exports.create = async (name) => {
    const id = 'iidd'
    const token = 'otokkken'

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
        throw err;
    }

    return {
        id,
        token,
    }
}