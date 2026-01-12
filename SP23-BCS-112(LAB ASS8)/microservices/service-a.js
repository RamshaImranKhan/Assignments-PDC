const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { data } = require('../utils/payload');

const PROTO_PATH = path.join(__dirname, '../grpc/user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

function getUser(call, callback) {
    // Simulate database lookup or processing time
    // setTimeout(() => {
    callback(null, data);
    // }, 5);
}

function main() {
    const server = new grpc.Server();
    server.addService(userProto.UserService.service, { getUser: getUser });
    server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
        console.log('Microservice A (User) running on 0.0.0.0:50052');
    });
}

main();
