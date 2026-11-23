import dataviewManifest from "./dataview/manifest.json" with { type: "json" };

export const DataviewWrapper = {
    manifest: dataviewManifest,
    pluginVersion: dataviewManifest.version satisfies string,
    indexVersion: dataviewManifest.version satisfies string,
};

export { DataviewApi } from "./dataview/src/api/plugin-api.ts";
export { FullIndex } from "./dataview/src/data-index/index.ts";
export { DEFAULT_SETTINGS as DEFAULT_DATAVIEW_SETTINGS, DataviewSettings } from "./dataview/src/settings.ts";
