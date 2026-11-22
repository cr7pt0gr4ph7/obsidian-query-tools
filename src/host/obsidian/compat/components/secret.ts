import type { App } from "../../../../api/vault/mock/app.js";
import { createDomElement } from "../fakedom.internal.js";
import { BaseComponent } from "./component.js";

/**
 * @public
 * @since 1.11.1
 */
export class SecretComponent extends BaseComponent {
	/** @internal */
	value: string;

	/** @internal */
	onChangeCallback?: (value: string | null) => unknown;

	/**
	 * @public
	 */
	constructor(app: App, containerEl: HTMLElement) {
		super();
		this.value = "";
	}

	/**
	 * @public
	 * @since 1.11.4
	 */
	setValue(value: string): this {
		if (this.value !== value) {
			this.value = value;
			this.onChangeCallback?.(value);
		}
		return this;
	}

	/**
	 * @public
	 * @since 1.11.4
	 */
	onChange(cb: (value: string | null) => unknown): this {
		this.onChangeCallback = cb;
		return this;
	}
}
