if (!globalThis.window) {
    const enableDebugLogging = false;
	class WindowMock {
		navigator = {
			get language() {
				return globalThis.navigator?.language ?? "en-US";
			},
		};
		// biome-ignore lint/suspicious/noConfusingVoidType: Allow a single void-accepting argument to be optional in arguments lists.
		setInterval(callback: (_: void) => void, delay?: number): NodeJS.Timeout;
		setInterval<TArgs extends any[]>(
			callback: (...args: TArgs) => void,
			delay?: number,
			...args: TArgs
		): NodeJS.Timeout;
		setInterval<TArgs extends any[]>(
			callback: (...args: TArgs) => void,
			delay?: number,
			...args: TArgs
		): NodeJS.Timeout {
			const timeout = globalThis.setInterval(callback as (...args: any[]) => void, delay, ...args);
			if (enableDebugLogging){
                console.debug("window.setInterval -> timerId:", timeout, "delay:", delay);
            }
			return timeout;
		}
		// biome-ignore lint/suspicious/noConfusingVoidType: Allow a single void-accepting argument to be optional in arguments lists.
		setTimeout(callback: (_: void) => void, delay?: number): NodeJS.Timeout;
        setTimeout<TArgs extends any[]>(callback: (...args: TArgs) => void, delay?: number, ...args: TArgs): NodeJS.Timeout;
		setTimeout<TArgs extends any[]>(
			callback: (...args: TArgs) => void,
			delay?: number,
			...args: TArgs
		): NodeJS.Timeout {
            const timeout = globalThis.setTimeout(callback as (...args: any[]) => void, delay, ...args);
            if (enableDebugLogging){
                console.debug("window.setTimeout -> timerId:", timeout, "delay:", delay);
            }
            return timeout;
        }
        clearInterval(timeout: NodeJS.Timeout | string | number | undefined): void {
            globalThis.clearInterval(timeout as NodeJS.Timeout);
            if (enableDebugLogging){
                console.debug("window.clearInterval -> timerId:", timeout);
            }
        }
        clearTimeout(timeout: NodeJS.Timeout | string | number | undefined): void {
            globalThis.clearTimeout(timeout as NodeJS.Timeout);
            if (enableDebugLogging){
                console.debug("window.clearTimeout -> timerId:", timeout);
            }
        }
	}

	globalThis.window = new WindowMock() as any;
}

export {};
