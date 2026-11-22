import { placeholder } from "../../placeholder.internal.js";
import { createDomElement } from "../fakedom.internal.js";
import { AbstractTextComponent } from "./text.js";

/**
 * A search component.
 * @public
 * @since 0.9.21
 */
export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
	/**
	 * The clear button element.
	 * @public
	 * @since 0.9.21
	 */
	clearButtonEl: HTMLElement = placeholder;

	/**
	 * @param containerEl The container element.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super(createDomElement("input", "search-component", containerEl) as HTMLInputElement);
	}

	/**
	 * Called when the value changes.
	 * @public
	 */
	onChanged(): void {}
}
