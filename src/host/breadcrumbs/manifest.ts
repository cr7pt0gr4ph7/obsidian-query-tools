import breadcrumbsManifest from "obsidian-breadcrumbs/manifest.json" with { type: "json" };

export const BreadcrumbsManifest = {
	manifest: breadcrumbsManifest,
	pluginVersion: breadcrumbsManifest.version satisfies string,
};
