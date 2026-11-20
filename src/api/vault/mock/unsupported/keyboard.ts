/**
 * Mod = Cmd on MacOS and Ctrl on other OS
 * Ctrl = Ctrl key for every OS
 * Meta = Cmd on MacOS and Win key on other OS
 * @public
 */
export type Modifier = "Mod" | "Ctrl" | "Meta" | "Shift" | "Alt";

/**
 * A hotkey.
 * @example
 * ```ts
 * const hotkey: Hotkey = { modifiers: ['Mod'], key: 'a' };
 * ```
 * @public
 */
export interface Hotkey {
	/**
	 * The modifier keys.
	 * @public
	 */
	modifiers: Modifier[];

	/**
	 * The main key.
	 * @public
	 */
	key: string;
}
