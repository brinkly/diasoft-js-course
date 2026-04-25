const cache = {
    result: null
};

const slowFunction = (timeout = 3000) => {
    const start = performance.now();
    let x = 0;
    let i = 0;

    do {
        i += 1;
        x += (Math.random() - 0.5) * i;
    } while (performance.now() - start < timeout);

    return x;
};

const recalculate = async (timeout) => {
    cache.result = slowFunction(timeout);
    return cache.result;
};

const getCachedResult = async (timeout) => {
    const cachedResult = cache.result;

    if (cachedResult) {
        return cachedResult;
    } else {
        return recalculate(timeout);
    }
};

const broadcast = async (msg) => {
    const clients = await self.clients.matchAll();

    for (const client of clients) {
        client.postMessage(msg);
    }
}

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', async (event) => {
    const { type, payload } = event.data || {};
    const timeout = payload?.timeout ?? 3000;

    if (type === 'GET_RESULT') {
        const resultPayload = await getCachedResult(timeout);
        await broadcast({
            type: 'RESULT',
            payload: resultPayload
        });
        return;
    }

    if (type === 'RECALCULATE') {
        const resultPayload = await recalculate(timeout);
        await broadcast({
            type: 'RESULT',
            payload: resultPayload
        });
    }
});
