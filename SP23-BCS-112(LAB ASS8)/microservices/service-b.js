const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { performance } = require('perf_hooks');

const app = express();
const PORT = 3001;

// gRPC Client Setup for Service A
const PROTO_PATH = path.join(__dirname, '../grpc/user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;
const clientA = new userProto.UserService('localhost:50052', grpc.credentials.createInsecure());

function getUserFromServiceA() {
    return new Promise((resolve, reject) => {
        clientA.getUser({}, (error, response) => {
            if (error) reject(error);
            else resolve(response);
        });
    });
}

app.get('/gateway/user', async (req, res) => {
    const start = performance.now();
    try {
        const userData = await getUserFromServiceA();
        const end = performance.now();
        // Add internal latency metrics to header or log
        console.log(`Service B -> A Call Duration: ${(end - start).toFixed(3)}ms`);
        res.json(userData);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Service B (Gateway) running on http://localhost:${PORT}`);
});
