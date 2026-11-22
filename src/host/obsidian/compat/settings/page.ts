import { createDomElement } from "../fakedom.internal.js";

/**
 * Base class for a sub-page within a {@link SettingTab}. Use with the `page`
 * factory on {@link SettingDefinitionPage} to render a sub-page imperatively
 * — useful when the page's content is dynamic or doesn't fit cleanly into a
 * list of definitions.
 *
 * For declarative sub-pages, use the `items` field on
 * {@link SettingDefinitionPage} instead.
 * @public
 * @since 1.13.0
 */
export abstract class SettingPage {
	/**
	 * @public
	 * @since 1.13.0
	 */
	rootEl: HTMLElement;

	/**
	 * @public
	 * @since 1.13.0
	 */
	titlebarEl: HTMLElement;

	/**
	 * Container for the page's content. Render into this element from
	 * {@link display}.
	 * @public
	 * @since 1.13.0
	 */
	containerEl: HTMLElement;

	/**
	 * Title displayed in the page titlebar.
	 * @public
	 * @since 1.13.0
	 */
	title: string;

	/**
	 * @public
	 * @since 1.13.0
	 */
	constructor() {
		this.title = "";
		this.rootEl = createDomElement("div", "setting-page");
		this.containerEl = createDomElement("div", "setting-page-container", this.rootEl);
		this.titlebarEl = createDomElement("div", "setting-page-titlebar", this.rootEl);
	}

	/**
	 * Called when the page is opened. Clears and re-renders content
	 * into {@link containerEl}.
	 * @public
	 * @since 1.13.0
	 */
	abstract display(): void;

	/**
	 * Hides the contents of the page. Any registered components should be
	 * unloaded when the page is hidden. Override this if you need to perform
	 * additional cleanup.
	 * Called when the user navigates away, the containing tab is switched, or
	 * the settings modal is closed. Not guaranteed to run when the host window
	 * is destroyed.
	 * @public
	 * @since 1.13.0
	 */
	hide(): void {
		// Ignored, as this is a stub implementation.
	}
}
