const axios = require('axios');
const { performance } = require('perf_hooks');

const URL = 'http://localhost:3000/user';
const ITERATIONS = 1000; // Number of calls to average

async function runBenchmark() {
    console.log(`Starting REST benchmark with ${ITERATIONS} iterations...`);

    // Warmup
    try {
        await axios.get(URL);
    } catch (err) {
        console.error("Server not reachable?", err.message);
        process.exit(1);
    }

    const times = [];
    let payloadSize = 0;

    const startTotal = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        const res = await axios.get(URL);
        const end = performance.now();

        times.push(end - start);

        if (i === 0) {
            // Approximate payload size from headers or raw data length
            // res.data is an object, so we verify JSON stringify length
            payloadSize = JSON.stringify(res.data).length;
        }
    }

    const endTotal = performance.now();
    const totalTime = endTotal - startTotal;
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    console.log('--- REST API Results ---');
    console.log(`Examples: ${ITERATIONS}`);
    console.log(`Avg Latency: ${avgTime.toFixed(3)} ms`);
    console.log(`Total Time: ${totalTime.toFixed(3)} ms`);
    console.log(`Payload Size (approx JSON): ${payloadSize} bytes`);
}

runBenchmark();
