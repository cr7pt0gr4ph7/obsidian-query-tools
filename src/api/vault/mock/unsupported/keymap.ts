import { Modifier } from "./keyboard.js";
import { UserEvent } from "./userevent.js";
import { PaneType } from "./workspace.js";

/**
 * A scope receives keyboard events and binds callbacks to given hotkeys.
 * Only one scope is active at a time, but scopes may define parent scopes (in the constructor) and inherit their hotkeys.
 * @public
 */
export class Scope {
	/**
	 * @param parent The parent scope. Key events that are not handled by this scope are passed to the parent.
	 * @public
	 */
	constructor(public parent?: Scope) {}

	/**
	 * Add a keymap event handler to this scope.
	 * @param modifiers `Mod`, `Ctrl`, `Meta`, `Shift`, or `Alt`. `Mod` translates to `Meta` on macOS and `Ctrl` otherwise. Pass `null` to capture all events matching the `key`, regardless of modifiers.
	 * @param key Key value from {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values}, or `null` to capture all keys.
	 * @param func the callback that will be called when a user triggers the keybind.
	 * @returns The keymap event handler, which can be passed to {@link Scope.unregister}.
	 * @example
	 * ```ts
	 * scope.register(['Mod', 'Shift'], 'L', (evt, ctx) => {
	 *     console.log('Mod+Shift+L pressed');
	 * });
	 * ```
	 * @public
	 */
	register(modifiers: Modifier[] | null, key: string | null, func: KeymapEventListener): KeymapEventHandler {
		throw new Error("Method not implemented.");
	}

	/**
	 * Remove an existing keymap event handler.
	 * @param handler The keymap event handler returned by {@link Scope.register}.
	 * @public
	 */
	unregister(handler: KeymapEventHandler): void {
		throw new Error("Method not implemented.");
	}
}

/**
 * Manages keymap lifecycle for different {@link Scope}s.
 *
 * @public
 * @since 0.13.9
 */
export class Keymap {
	/**
	 * Push a scope onto the scope stack, setting it as the active scope to handle all key events.
	 * @param scope The scope.
	 * @public
	 * @since 0.13.9
	 */
	pushScope(scope: Scope): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Remove a scope from the scope stack.
	 * If the given scope is active, the next scope in the stack will be made active.
	 * @param scope The scope.
	 * @public
	 * @since 0.13.9
	 */
	popScope(scope: Scope): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Checks whether the modifier key is pressed during this event.
	 * @param evt The event.
	 * @param modifier The modifier.
	 * @example
	 * ```ts
	 * if (Keymap.isModifier(evt, 'Ctrl')) {
	 *     console.log('Ctrl is pressed');
	 * }
	 * ```
	 * @public
	 * @since 0.12.17
	 */
	static isModifier(evt: MouseEvent | TouchEvent | KeyboardEvent, modifier: Modifier): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * Translates an event into the type of pane that should open.
	 * @param evt The event.
	 * @returns
	 * - `false` if `evt` is `null`, `undefined` or none of the modifier keys are pressed.
	 * - `'tab'` if Cmd/Ctrl is pressed, or if `evt` is a middle click.
	 * - `'split'` if Cmd/Ctrl+Alt is pressed.
	 * - `'window'` if Cmd/Ctrl+Alt+Shift is pressed.
	 * @public
	 * @since 0.16.0
	 */
	static isModEvent(evt?: UserEvent | null): PaneType | boolean {
		throw new Error("Method not implemented.");
	}	
}

/**
 * The context passed to a keymap event listener.
 * @public
 */
export interface KeymapContext extends KeymapInfo {
	/**
	 * Interpreted virtual key.
	 * @public
	 */
	vkey: string;
}

/**
 * A keymap event handler registered with {@link Scope.register}.
 * @public
 */
export interface KeymapEventHandler extends KeymapInfo {
	/**
	 * The scope that the handler is registered in.
	 * @public
	 */
	scope: Scope;
}

/**
 * A keymap event listener.
 * Return `false` to automatically preventDefault.
 * @public
 */
export type KeymapEventListener = (evt: KeyboardEvent, ctx: KeymapContext) => false | any;

/**
 * Information about the key combination.
 * @public
 * @since 0.10.4
 */
export interface KeymapInfo {
	/**
	 * The modifier keys of the key combination, separated by commas, such as `'Mod,Shift'`.
	 * @public
	 * @since 0.10.4
	 */
	modifiers: string | null;
	/**
	 * The main key of the key combination.
	 * @public
	 * @since 0.10.4
	 */
	key: string | null;
}
