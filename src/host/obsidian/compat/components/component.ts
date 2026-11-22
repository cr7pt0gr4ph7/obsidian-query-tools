/**
 * The base class for all components.
 * @public
 * @since 0.10.3
 */
export abstract class BaseComponent {
	/**
	 * Whether the component is disabled.
	 * @public
	 * @since 0.10.3
	 */
	disabled: boolean = false;

	/**
	 * Facilitates chaining.
	 * @param cb Called with this component.
	 * @public
	 * @since 0.9.7
	 */
	// biome-ignore lint/suspicious/noThenProperty: This is intended for chaining.
	then(cb: (component: this) => unknown): this {
		cb(this);
		return this;
	}

	/**
	 * Set whether the component is disabled.
	 * @param disabled `true` to disable, `false` to enable.
	 * @public
	 * @since 1.2.3
	 */
	setDisabled(disabled: boolean): this {
		this.disabled = disabled;
		return this;
	}
}
