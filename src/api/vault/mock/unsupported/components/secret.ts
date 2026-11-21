import type { App } from "../../app.js";
import { BaseComponent } from "./component.js";

/**
 * @public
 * @since 1.11.1
 */
export class SecretComponent extends BaseComponent {
	/**
	 * @public
	 */
	constructor(app: App, containerEl: HTMLElement) {
		super();
	}

	/**
	 * @public
	 * @since 1.11.4
	 */
	setValue(value: string): this {
		return this;
	}

	/**
	 * @public
	 * @since 1.11.4
	 */
	onChange(cb: (value: string | null) => unknown): this {
		return this;
	}
}
