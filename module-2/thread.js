self.onmessage = (event) => {
    const timeout = event.data || 3000;
    const thread2 = new Worker('./thread-2.js');

    thread2.onmessage = (workerEvent) => {
        postMessage(workerEvent.data);
        thread2.terminate();
    };

    thread2.postMessage(timeout);
};
