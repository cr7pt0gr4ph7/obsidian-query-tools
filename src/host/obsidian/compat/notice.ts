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
	constructor(message: string | DocumentFragment, duration?: number) {
		this.noticeEl = {} as HTMLElement;
		this.containerEl = {} as HTMLElement;
		this.messageEl = {} as HTMLElement;
	}

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
	setMessage(message: string | DocumentFragment): this {
		return this;
	}

	/**
	 * Hide the notice.
	 * @public
	 * @since 0.9.7
	 */
	hide(): void {
		// Compatibility no-op.
	}
}
