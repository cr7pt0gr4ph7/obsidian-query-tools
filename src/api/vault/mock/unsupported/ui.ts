import type { WorkspaceLeaf } from "./workspace.js";

/**
 * An instruction shown in a suggestion modal.
 * @example
 * ```ts
 * const instruction: Instruction = { command: '↑↓', purpose: 'Navigate' };
 * ```
 * @public
 * @since 0.9.20
 */
export interface Instruction {
	/**
	 * The command or the key combination.
	 * @public
	 * @since 0.9.20
	 */
	command: string;
	/**
	 * The purpose of the command.
	 * @public
	 * @since 0.9.20
	 */
	purpose: string;
}

/**
 * Notification component. Use to present timely, high-value information.
 * @public
 * @since 0.9.7
 */
export class Notice {
	/**
	 * The notice element.
	 * @public
	 * @deprecated Use `messageEl` instead
	 * @since 0.9.7
	 */
	noticeEl: HTMLElement;
	/**
	 * The container element.
	 * @public
	 * @since 1.8.7
	 */
	containerEl: HTMLElement;
	/**
	 * The message element.
	 * @public
	 * @since 1.8.7
	 */
	messageEl: HTMLElement;

	/**
	 * @param message The message.
	 * @param duration Time in milliseconds to show the notice for. If this is `0`, the
	 * `Notice` will stay visible until the user manually dismisses it.
	 * @example
	 * ```ts
	 * new Notice('foo');
	 *
	 * const fragment = createFragment();
	 * fragment.createEl('strong', { text: 'bar' });
	 * new Notice(fragment);
	 *
	 * new Notice('baz', 1000); // will be visible for 1 second
	 * new Notice('qux', 0); // will stay visible until the user manually dismisses it
	 * ```
	 * @public
	 */
	constructor(message: string | DocumentFragment, duration?: number);
	/**
	 * Change the message of this notice.
	 * @param message The message.
	 * @example
	 * ```ts
	 * notice.setMessage('foo');
	 *
	 * const fragment = createFragment();
	 * fragment.createEl('strong', { text: 'bar' });
	 * notice.setMessage(fragment);
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	setMessage(message: string | DocumentFragment): this;

	/**
	 * Hide the notice.
	 * @public
	 * @since 0.9.7
	 */
	hide(): void;
}

/**
 * Options for opening a file in a leaf.
 * @public
 */
export interface OpenViewState {
	/**
	 * The view state.
	 * @public
	 */
	state?: Record<string, unknown>;
	/**
	 * The ephemeral state.
	 * @public
	 */
	eState?: Record<string, unknown>;
	/**
	 * Whether to make the leaf active. Omit to follow the user's preference.
	 * @public
	 */
	active?: boolean;
	/**
	 * A leaf to link this leaf with. See {@link WorkspaceLeaf.setGroupMember}.
	 * @public
	 */
	group?: WorkspaceLeaf;
}
