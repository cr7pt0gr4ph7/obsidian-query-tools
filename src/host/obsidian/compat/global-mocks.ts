import "fake-indexeddb/auto";
import Worker from "web-worker";

if (typeof globalThis.window === "undefined" || !globalThis.localStorage) {
	const values = new Map<string, string>();
	globalThis.localStorage = {
		get length() {
			return values.size;
		},
		clear: () => values.clear(),
		getItem: (key) => values.get(String(key)) ?? null,
		key: (index) => [...values.keys()][index] ?? null,
		removeItem: (key) => values.delete(String(key)),
		setItem: (key, value) => values.set(String(key), String(value)),
	};
}

if (!globalThis.Worker) {
	globalThis.Worker = Worker;
}

if (!globalThis.window) {
	globalThis.window = {
		setInterval: globalThis.setInterval,
		clearInterval: globalThis.clearInterval,
		setTimeout: globalThis.setTimeout,
		clearTimeout: globalThis.clearTimeout,
		performance: globalThis.performance,
		navigator: {
			get language() {
				return globalThis.navigator?.language ?? "en-US";
			},
		},
	} as any;
}
