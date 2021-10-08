export function createLock() {
    let cnt = 0;
    
    let _resolve: (v: unknown) => void;
    const promise = new Promise((resolve) => {
        _resolve = resolve;
    });
    
    return {
        promise,
        begin() {
            cnt++;
            console.log("begined",cnt)
        },
        end() {
            if (cnt <= 0)
                _resolve(undefined);
            cnt--;
            console.log("begined",cnt)
        },
        cb<K extends (...args: any) => Promise<undefined>, T extends Parameters<K>>(fn: (...args: T) => Promise<unknown>): K {
            return (async (...args: T) => {
                this.begin();
                try {
                    await fn(...args as any);
                } finally {
                    this.end();
                }
            }) as K
        }
    }
}

export async function sleep(i: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, i);
    })
}
