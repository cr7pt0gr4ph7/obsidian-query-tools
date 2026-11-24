import dataviewManifest from "obsidian-dataview/manifest.json" with { type: "json" };

export const DataviewManifest = {
	manifest: dataviewManifest,
	pluginVersion: dataviewManifest.version satisfies string,
	indexVersion: dataviewManifest.version satisfies string,
};
