import type { App } from "./app.js";
import { Component } from "./lifecycle.js";

/**
 * Base class for all plugins.
 * @public
 * @since 0.9.7
 */
export abstract class Plugin extends Component {
	/**
	 * The app instance.
	 * @public
	 * @since 0.9.7
	 */
	app: App;

	/**
	 * The plugin manifest.
	 * @public
	 * @since 0.9.7
	 */
	manifest: PluginManifest;

	/**
	 * Plugin settings. Assign loaded data here in `onload`. Declare a
	 * concrete type on your subclass to type it.
	 * @public
	 * @since 1.13.0
	 */
	settings?: unknown;

	/**
	 * @param app The app instance.
	 * @param manifest The plugin manifest.
	 * @public
	 */
	constructor(app: App, manifest: PluginManifest) {
		super();
		this.app = app;
		this.manifest = manifest;
	}

	/**
	 * Called when the plugin is loaded.
	 * @public
	 * @since 0.9.7
	 */
	onload(): Promise<void> | void {}

	// Extracted into IRibbonIconPlugin_
	// Extracted into IStatusBarPlugin_
	// Extracted into ICommandPlugin_
	// Extracted into ISettingsPlugin_
	// Extracted into IViewPlugin_
	// Extracted into IHoverPlugin_
	// Extracted into IFileExtensionPlugin_
	// Extracted into IMarkdownProcessorPlugin_
	// Extracted into IBasesViewPlugin_
	// Extracted into IEditorPlugin_
	// Extracted into IObsidianProtocolPlugin_
	// Extracted into IEditorSuggestPlugin_
	// Extracted into ICliPlugin_

	/**
	 * Load settings data from disk.
	 * Data is stored in `data.json` in the plugin folder.
	 * @see {@link https://docs.obsidian.md/Plugins/User+interface/Settings}.
	 * @returns The settings data, or `null` if no data has been saved yet.
	 * @public
	 * @since 0.9.7
	 */
	async loadData(): Promise<any> {
		return null;
	}

	/**
	 * Write settings data to disk.
	 * Data is stored in `data.json` in the plugin folder.
	 * @see {@link https://docs.obsidian.md/Plugins/User+interface/Settings}.
	 * @param data The settings data.
	 * @public
	 * @since 0.9.7
	 */
	async saveData(data: any): Promise<void> {
		return;
	}

	/**
	 * Perform any initial setup code. The user has explicitly interacted with the plugin,
	 * so it's safe to engage with the user. If your plugin registers a custom view,
	 * you can open it here.
	 * @public
	 * @since 1.7.2
	 */
	onUserEnable(): void {}

	/**
	 * Called when the `data.json` file is modified on disk externally from Obsidian.
	 * This usually means that a Sync service or external program has modified
	 * the plugin settings.
	 *
	 * Implement this method to reload plugin settings when they have changed externally.
	 * @public
	 * @since 1.5.7
	 */
	onExternalSettingsChange?(): any {
		throw new Error("Method not implemented.");
	}
}

/**
 * Metadata about a Community plugin.
 * @see {@link https://docs.obsidian.md/Reference/Manifest}.
 * @public
 */
export interface PluginManifest {
	/**
	 * Vault path to the plugin folder in the config directory.
	 * @public
	 */
	dir?: string;

	/**
	 * The plugin ID.
	 * @public
	 */
	id: string;

	/**
	 * The display name.
	 * @public
	 */
	name: string;

	/**
	 * The author's name.
	 * @public
	 */
	author: string;

	/**
	 * The current version, using {@link https://semver.org/ Semantic Versioning}.
	 * @public
	 */
	version: string;

	/**
	 * The minimum required Obsidian version to run this plugin.
	 * @public
	 */
	minAppVersion: string;

	/**
	 * A description of the plugin.
	 * @public
	 */
	description: string;

	/**
	 * A URL to the author's website.
	 * @public
	 */
	authorUrl?: string;

	/**
	 * Whether the plugin can be used only on desktop.
	 * @public
	 */
	isDesktopOnly?: boolean;
}
