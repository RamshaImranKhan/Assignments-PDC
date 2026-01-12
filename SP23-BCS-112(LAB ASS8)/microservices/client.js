const axios = require('axios');
const { performance } = require('perf_hooks');

const URL = 'http://localhost:3001/gateway/user';
const ITERATIONS = 1000;

async function runBenchmark() {
    console.log(`Starting Microservices benchmark with ${ITERATIONS} iterations...`);

    // Warmup
    try {
        await axios.get(URL);
    } catch (err) {
        console.error("Server not reachable?", err.message);
        process.exit(1);
    }

    const times = [];

    const startTotal = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        await axios.get(URL);
        const end = performance.now();
        times.push(end - start);
    }
    const endTotal = performance.now();

    const totalTime = endTotal - startTotal;
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    console.log('--- Microservices (REST -> gRPC) Results ---');
    console.log(`Examples: ${ITERATIONS}`);
    console.log(`Avg Latency: ${avgTime.toFixed(3)} ms`);
    console.log(`Total Time: ${totalTime.toFixed(3)} ms`);
}

runBenchmark();
