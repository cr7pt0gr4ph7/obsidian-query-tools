import type { DataviewApi } from "obsidian-dataview";
import dataviewManifest from "./dataview/manifest.json" with { type: "json" };

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

export {
	DataviewApi,
	DataviewSettings,
	DEFAULT_DATAVIEW_SETTINGS,
	FullIndex,
} from "obsidian-dataview";
