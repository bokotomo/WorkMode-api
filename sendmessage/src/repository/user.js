const ddbClient = require('../driver/ddb');

module.exports.create = async (name) => {
    const id = 'iidd'
    const token = 'otokkken'
    return {
        id,
        token,
    }
}