// Waiting in the tests: for some time, or for a condition

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Once [condition] holds, looked at every few milliseconds: a failure telling [what] once [ms] milliseconds have passed */
export async function until(condition: () => boolean, what: string, ms = 5000): Promise<void> {
    const end = Date.now() + ms;
    while (!condition()) {
        if (Date.now() > end) throw new Error(`Still waiting for ${what}`);
        await sleep(10);
    }
}
