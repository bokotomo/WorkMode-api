
// let connectionData;
// try {
//   connectionData = await ddbClient.scan({ TableName: TABLE_NAME, ProjectionExpression: 'connectionId' }).promise();
// } catch (e) {
//   throw e;
// }

// const postCalls = connectionData.Items.map(async ({ connectionId }) => {
//   try {
//     await apigwClient.postToConnection({ ConnectionId: connectionId, Data: event.requestContext.connectionId }).promise();
//   } catch (e) {
//     if (e.statusCode === 410) {
//       console.log(`Found stale connection, deleting ${connectionId}`);
//       await ddbClient.delete({ TableName: TABLE_NAME, Key: { connectionId } }).promise();
//     } else {
//       throw e;
//     }
//   }
// });

// try {
//   await Promise.all(postCalls);
// } catch (e) {
//   throw e;
// }