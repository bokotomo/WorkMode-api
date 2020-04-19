const ddbClient = require('../driver/ddb');
var uniqid = require('uniqid');

module.exports.create = async (userID, task) => {
    const id = uniqid();
    const domainTask = {
        ...task,
        id,
    };
    const putParams = {
        TableName: 'workmode_tasks',
        Item: {
            userId: userID,
            tasks: [domainTask],
        }
    };
    try {
        await ddbClient.put(putParams).promise();
    } catch (err) {
        return [{}, err]
    }

    return [domainTask, null]
}