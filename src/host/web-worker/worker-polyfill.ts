import Worker from "web-worker";

if (!globalThis.Worker) {
	globalThis.Worker = Worker;
}

// biome-ignore lint/complexity/noUselessEmptyExport: Explicitly mark this file as importable
export {};
