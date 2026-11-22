import { createDomElement } from "../fakedom.internal.js";

/**
 * A read-only display value for a setting row: a value label and an optional
 * status indicator. On a navigable row, it surfaces the value edited on the
 * page the row opens, so the user can see it without opening that page.
 * @public
 * @since 1.13.1
 */
export class DisplayValueComponent {
	/**
	 * @public
	 * @since 1.13.1
	 */
	valueEl: HTMLElement;

	/**
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		this.valueEl = createDomElement("div", "display-value", containerEl);
	}

	/**
	 * Set the value label text. Pass an empty string or `null` to clear it.
	 * @public
	 * @since 1.13.1
	 */
	setValue(value: string | null): this {
		// Ignored, as this is a stub implementation.
		return this;
	}

	/**
	 * Show a status indicator on the row. Use `'warning'` when the value needs
	 * the user's attention; the explanation itself belongs on the page this
	 * row leads to, while this only signals that there is something to look at.
	 * Pass `null` to clear it.
	 * @public
	 * @since 1.13.1
	 */
	setStatus(status: "warning" | null): this {
		// Ignored, as this is a stub implementation.
		return this;
	}
}
