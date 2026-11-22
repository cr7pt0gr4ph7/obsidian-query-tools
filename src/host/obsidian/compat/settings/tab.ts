import type { App } from "../../app.js";
import type { Plugin } from "../../extensions/plugin.js";
import type { IconName } from "../icons.js";
import type { SettingDefinitionItem } from "./definitions.js";
import type { Setting } from "./setting.js";

/**
 * A setting tab.
 * @public
 * @see {@link https://docs.obsidian.md/Plugins/User+interface/Settings#Register+a+settings+tab}.
 * @since 0.9.7
 */
export abstract class SettingTab {
	/**
	 * The icon to display in the settings sidebar.
	 * @public
	 * @since 1.11.0
	 */
	declare icon: IconName;

	/**
	 * Reference to the app instance.
	 * @public
	 */
	declare app: App;

	/**
	 * HTML element for the setting tab content.
	 * @public
	 */
	declare containerEl: HTMLElement;

	/**
	 * Nested setting definitions as returned by getSettingDefinitions().
	 * Populated by update().
	 * @public
	 * @since 1.13.0
	 */
	declare settingItems: SettingDefinitionItem[];

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Override to provide setting definitions. Return an array of definitions
	 * and inline groups. Called on every display() and once when the tab is
	 * added to the setting modal for search indexing.
	 * @public
	 * @since 1.13.0
	 */
	getSettingDefinitions(): SettingDefinitionItem[] {
		// Override in subclasses to provide setting definitions.
		return [];
	}

	/**
	 * Stores the result of getSettingDefinitions() for rendering and search indexing.
	 * Called by addSettingTab() and by dynamic tabs when their data changes.
	 * @public
	 * @since 1.13.0
	 */
	update(): void {
		this.settingItems = this.getSettingDefinitions();
	}

	/**
	 * Read the current value for a control key. Called on every render of a
	 * `control`-type setting definition.
	 *
	 * The default implementation reads from `this.app.vault.getConfig` —
	 * appropriate for the app's own setting tabs. `PluginSettingTab` and
	 * `InternalPluginSettingTab` override this to read from their conventional
	 * settings storage; plugins with custom storage override on their
	 * subclass.
	 * @public
	 * @since 1.13.0
	 */
	getControlValue(key: string): unknown {
		return this.app.vault.getConfig(key);
	}

	/**
	 * Persist a new value for a control key. Called on user change of a
	 * `control`-type setting definition.
	 *
	 * The default implementation writes to `this.app.vault.setConfig`.
	 * Override to persist elsewhere; pair with `getControlValue`.
	 * @public
	 * @since 1.13.0
	 */
	setControlValue(key: string, value: unknown): void | Promise<void> {
		return this.app.vault.setConfig(key, value);
	}

	/**
	 * Re-evaluate every `visible` and `disabled` predicate against the
	 * current state and apply the result to the rendered DOM. Call this
	 * from a `render` callback's onChange (or any other imperative path)
	 * after mutating state that other settings' predicates depend on.
	 *
	 * Cheap: toggles CSS state in place, no re-render. For changes that
	 * affect the structure of the definitions themselves (added or removed
	 * items), call `update()` instead.
	 * @public
	 * @since 1.13.0
	 */
	refreshDomState(): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Override to render the tab imperatively.
	 *
	 * Not called when {@link getSettingDefinitions} returns a non-empty array;
	 * the tab is rendered declaratively from those definitions instead. Only
	 * implement display() as a fallback for plugins that need to support
	 * Obsidian versions older than 1.13.0.
	 * @see {@link https://docs.obsidian.md/Plugins/User+interface/Settings#Register+a+settings+tab}
	 * @deprecated Since 1.13.0. Use {@link getSettingDefinitions} instead.
	 * @public
	 */
	display(): void {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Hides the contents of the setting tab.
	 * Any registered components should be unloaded when the view is hidden.
	 * Override this if you need to perform additional cleanup.
	 * @public
	 */
	hide(): void {
		// Ignored, as this is a stub implementation.
	}
}

/**
 * Provides a unified interface for users to configure the plugin.
 * @see {@link https://docs.obsidian.md/Plugins/User+interface/Settings#Register+a+settings+tab}.
 * @public
 * @since 0.9.7
 */
export abstract class PluginSettingTab extends SettingTab {
	plugin: Plugin;

	/**
	 * @param app The app instance.
	 * @param plugin The plugin.
	 * @public
	 */
	constructor(app: App, plugin: Plugin) {
		super(app);
		this.plugin = plugin;
	}

	/**
	 * @public
	 * @since 1.13.0
	 */
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [];
	}

	/**
	 * Reads from `this.plugin.settings`. Override to read from a different
	 * data source.
	 * @public
	 * @since 1.13.0
	 */
	getControlValue(key: string): unknown {
		return super.getControlValue(key);
	}

	/**
	 * Mutates and persists `this.plugin.settings`. Override to write to a
	 * different data source.
	 * @public
	 * @since 1.13.0
	 */
	setControlValue(key: string, value: unknown): void | Promise<void> {
		return super.setControlValue(key, value);
	}
}
