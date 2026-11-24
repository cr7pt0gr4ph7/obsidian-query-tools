import "fake-indexeddb/auto";
import { LocalStorage } from "node-localstorage";
import Worker from "web-worker";

if (!globalThis.localStorage) {
	globalThis.localStorage = new LocalStorage("./scratch");
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
		navigator: {
			get language() {
				return globalThis.navigator?.language ?? "en-US";
			},
		},
	} as any;
}
