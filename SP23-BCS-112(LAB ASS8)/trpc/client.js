const { createTRPCClient, httpBatchLink } = require('@trpc/client');
const { performance } = require('perf_hooks');

const client = createTRPCClient({
    links: [
        httpBatchLink({
            url: 'http://localhost:4000',
        }),
    ],
});

const ITERATIONS = 1000;

async function runBenchmark() {
    console.log(`Starting tRPC benchmark with ${ITERATIONS} iterations...`);

    // Warmup
    try {
        await client.getUser.query();
    } catch (err) {
        console.error("Server not reachable?", err.message);
        process.exit(1);
    }

    const times = [];
    let payloadSize = 0;

    const startTotal = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        const res = await client.getUser.query();
        const end = performance.now();
        times.push(end - start);

        if (i === 0) {
            payloadSize = JSON.stringify(res).length;
        }
    }

    const endTotal = performance.now();
    const totalTime = endTotal - startTotal;
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    console.log('--- tRPC API Results ---');
    console.log(`Examples: ${ITERATIONS}`);
    console.log(`Avg Latency: ${avgTime.toFixed(3)} ms`);
    console.log(`Total Time: ${totalTime.toFixed(3)} ms`);
    console.log(`Payload Size (approx JSON): ${payloadSize} bytes`);
}

runBenchmark();
