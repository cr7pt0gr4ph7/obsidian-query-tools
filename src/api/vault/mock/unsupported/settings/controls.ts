import type { TFile, TFolder } from "../../files/files.js";
import type { HexString } from "../../unsupported_api.js";

/**
 * @public
 * @since 1.13.0
 */
export type SettingControl<K extends string = string> =
	| SettingToggleControl<K>
	| SettingDropdownControl<K>
	| SettingTextControl<K>
	| SettingTextAreaControl<K>
	| SettingNumberControl<K>
	| SettingFileControl<K>
	| SettingFolderControl<K>
	| SettingSliderControl<K>
	| SettingColorControl<K>
	| SettingSecretControl<K>;

/**
 * @public
 * @since 1.13.0
 */
export interface SettingControlBase<V, K extends string = string> {
	/**
	 * The config/storage property name passed to `getControlValue` and
	 * `setControlValue` on the setting tab.
	 * @public
	 * @since 1.13.0
	 */
	key: K;

	/**
	 * Fallback when the resolver returns undefined/null.
	 * @public
	 * @since 1.13.0
	 */
	defaultValue?: V;

	/**
	 * Validate a candidate value before it is persisted. Return a non-empty
	 * string to reject the change and surface it as an inline error message
	 * below the setting; return void/empty/undefined to accept and persist.
	 *
	 * Primarily intended for text-bearing controls (`text`, `textarea`,
	 * `number`, `file`, `folder`) where the user can enter values the bind's
	 * type alone can't constrain.
	 *
	 * The stored value may already be invalid when the setting is rendered
	 * (e.g. data from a previous version of your plugin). The framework
	 * runs `validate` once on mount and shows the message if the seeded
	 * value fails; it does not modify or replace the stored value. Plugins
	 * that need to enforce invariants on stored data should validate again
	 * when reading their settings.
	 * @public
	 * @since 1.13.0
	 */
	validate?: (value: V) => string | void | Promise<string | void>;

	/**
	 * Disables the control. Evaluated on each render, so a function form can
	 * reflect runtime state (e.g. whether another plugin is installed). Call
	 * `update()` on the setting tab to re-evaluate after the underlying state
	 * changes.
	 * @public
	 * @since 1.13.0
	 */
	disabled?: boolean | (() => boolean);
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingToggleControl<K extends string = string> extends SettingControlBase<boolean, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "toggle";
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingDropdownControl<K extends string = string> extends SettingControlBase<string, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "dropdown";

	/**
	 * @public
	 * @since 1.13.0
	 */
	options: Record<string, string>;
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingTextControl<K extends string = string> extends SettingControlBase<string, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "text";

	/**
	 * @public
	 * @since 1.13.0
	 */
	placeholder?: string;
}

/**
 * Multi-line text input. Persists a string.
 * @public
 * @since 1.13.0
 */
export interface SettingTextAreaControl<K extends string = string> extends SettingControlBase<string, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "textarea";

	/**
	 * @public
	 * @since 1.13.0
	 */
	placeholder?: string;

	/**
	 * Initial number of visible rows.
	 * @public
	 * @since 1.13.0
	 */
	rows?: number;
}

/**
 * Numeric text input. Persists a number; falls back to `defaultValue` (or `0`) if the
 * input cannot be parsed.
 * @public
 * @since 1.13.0
 */
export interface SettingNumberControl<K extends string = string> extends SettingControlBase<number, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "number";

	/**
	 * @public
	 * @since 1.13.0
	 */
	placeholder?: string;

	/**
	 * @public
	 * @since 1.13.0
	 */
	min?: number;

	/**
	 * @public
	 * @since 1.13.0
	 */
	max?: number;

	/**
	 * @public
	 * @since 1.13.0
	 */
	step?: number | "any";
}

/**
 * File-path input with a vault file suggester. Persists the selected file's
 * full path including extension (e.g. `folder/note.md`). Resolve the saved
 * path with `Vault.getFileByPath()`.
 * @public
 * @since 1.13.0
 */
export interface SettingFileControl<K extends string = string> extends SettingControlBase<string, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "file";

	/**
	 * @public
	 * @since 1.13.0
	 */
	placeholder?: string;

	/**
	 * Optional filter — only files for which this returns truthy are suggested.
	 * @public
	 * @since 1.13.0
	 */
	filter?: (file: TFile) => boolean;
}

/**
 * Folder-path input with a vault folder suggester. Persists the selected folder's
 * path (a string).
 * @public
 * @since 1.13.0
 */
export interface SettingFolderControl<K extends string = string> extends SettingControlBase<string, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "folder";

	/**
	 * @public
	 * @since 1.13.0
	 */
	placeholder?: string;

	/**
	 * Optional filter — only folders for which this returns truthy are suggested.
	 * @public
	 * @since 1.13.0
	 */
	filter?: (folder: TFolder) => boolean;

	/**
	 * Whether the vault root is offered as a suggestion. Default: false.
	 * @public
	 * @since 1.13.0
	 */
	includeRoot?: boolean;
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingSliderControl<K extends string = string> extends SettingControlBase<number, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "slider";

	/**
	 * @public
	 * @since 1.13.0
	 */
	min: number;

	/**
	 * @public
	 * @since 1.13.0
	 */
	max: number;

	/**
	 * @public
	 * @since 1.13.0
	 */
	step: number;

	/**
	 * Formats the value shown inline next to the slider. Return an empty
	 * string to hide the inline value entirely.
	 * @public
	 * @since 1.13.1
	 */
	displayFormat?: (value: number) => string;
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingColorControl<K extends string = string> extends SettingControlBase<HexString, K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "color";
}

/**
 * Links the setting to a secret stored in SecretStorage. Persists the secret's
 * key (a string reference), not the secret itself; the value is read from and
 * managed through `app.secretStorage`.
 * @public
 * @since 1.13.2
 */
export interface SettingSecretControl<K extends string = string> extends SettingControlBase<string, K> {
	/**
	 * @public
	 * @since 1.13.2
	 */
	type: "secret";
}
