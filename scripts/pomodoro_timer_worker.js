let curTimer = null;

onmessage = (e) => {
    if (curTimer !== null) {
        clearInterval(curTimer);
        curTimer = null;
    }
    const d0 = e.data;
    const countUpTimer = (d0) => {
        const d = new Date();
        const diff = d - d0;
        postMessage(Math.floor(diff/1000));
    };
    curTimer = setInterval(() => {countUpTimer(d0)}, 1000);
};