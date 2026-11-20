import type { App } from "../app.js";
import { StringValue } from "../values.js";

/**
 * {@link Value} wrapping raw HTML.
 * @public
 * @since 1.10.0
 */
export class HTMLValue extends StringValue {}

/**
 * {@link Value} wrapping a renderable icon.
 * @public
 * @since 1.10.0
 */
export class IconValue extends StringValue {}

/**
 * {@link Value} wrapping a path to an image resource in the vault.
 * @public
 * @since 1.10.0
 */
export class ImageValue extends StringValue {}

/**
 * {@link Value} wrapping an internal wikilink.
 * @public
 * @since 1.10.0
 */
export class LinkValue extends StringValue {
	/**
	 * Create a new LinkValue from wikilink syntax.
	 * @example
	 * parseFromString("[[Welcome|Example Link]]")
	 *
	 * @public
	 * @since 1.10.0
	 */
	static parseFromString(app: App, input: string, sourcePath: string): LinkValue | null {
		throw new Error("Method not implemented.");
	}
}
