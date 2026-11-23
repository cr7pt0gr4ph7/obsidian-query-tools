import type { App } from "../app.js";

/** @unofficial */
export class Plugins {
	enabledPlugins: Set<string> = new Set();
	plugins: Record<string, any> = {};

	constructor(public app: App) {}
}
