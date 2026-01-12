const { initTRPC } = require('@trpc/server');
const { createHTTPServer } = require('@trpc/server/adapters/standalone');
const { z } = require('zod');
const { data } = require('../utils/payload');
const cors = require('cors');

const t = initTRPC.create();

const appRouter = t.router({
    getUser: t.procedure
        .query(() => {
            return data;
        }),
});

const server = createHTTPServer({
    middleware: cors(),
    router: appRouter,
});

server.listen(4000);
console.log('tRPC Server running on http://localhost:4000');
