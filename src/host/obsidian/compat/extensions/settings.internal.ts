import type { PluginSettingTab } from "../settings/tab.js";

export interface ISettingsPluginRegistry {
	/**
	 * Register a settings tab, which allows users to change settings.
	 * @see {@link https://docs.obsidian.md/Plugins/User+interface/Settings#Register+a+settings+tab}.
	 * @param settingTab The setting tab.
	 * @public
	 * @since 0.9.7
	 */
	addSettingTab(settingTab: PluginSettingTab): void;
}

export function SettingsPluginRegistry<Base extends new (...args: any[]) => any>(Base: Base) {
	return class extends Base implements ISettingsPluginRegistry {
		_settingTabs: PluginSettingTab[] = [];

		addSettingTab(settingTab: PluginSettingTab): void {
			this._settingTabs.push(settingTab);
		}
	};
}
