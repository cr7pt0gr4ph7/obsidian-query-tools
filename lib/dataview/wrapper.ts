import dataviewManifest from "./dataview/manifest.json" with { type: "json" };
import type { DataviewApi } from "./dataview/src/api/plugin-api.js";

export const DataviewWrapper = {
	manifest: dataviewManifest,
	pluginVersion: dataviewManifest.version satisfies string,
	indexVersion: dataviewManifest.version satisfies string,
};

declare global {
	interface Window {
		DataviewAPI?: DataviewApi;
	}
}

export { DataviewApi } from "./dataview/src/api/plugin-api.js";
export { FullIndex } from "./dataview/src/data-index/index.js";
export { DataviewSettings, DEFAULT_SETTINGS as DEFAULT_DATAVIEW_SETTINGS } from "./dataview/src/settings.js";
