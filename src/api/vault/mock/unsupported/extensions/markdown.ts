import { Component } from "../../../../../host/obsidian/base/lifecycle.js";

export interface IMarkdownProcessorPlugin_ {
	/**
	 * Registers a post processor, to change how the document looks in reading mode.
	 * @see {@link https://docs.obsidian.md/Plugins/Editor/Markdown+post+processing}.
	 * @param postProcessor The post processor.
	 * @param sortOrder The sort order.
	 * @example
	 * ```ts
	 * plugin.registerMarkdownPostProcessor((el, ctx) => {
	 *     el.createEl('strong');
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): MarkdownPostProcessor;

	/**
	 * Register a special post processor that handles fenced code given a language and a handler.
	 * This special post processor takes care of removing the `<pre><code>` and create a `<div>` that
	 * will be passed to the handler, and is expected to be filled with custom elements.
	 * @see {@link https://docs.obsidian.md/Plugins/Editor/Markdown+post+processing#Post-process+Markdown+code+blocks}.
	 * @param language The code block language.
	 * @param handler Renders the code block, given its source, the element to render into, and the context.
	 * @param sortOrder The sort order.
	 * @example
	 * ```ts
	 * plugin.registerMarkdownCodeBlockProcessor('foo', (source, el, ctx) => {
	 *     el.createEl('strong');
	 * });
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	registerMarkdownCodeBlockProcessor(
		language: string,
		handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | undefined,
		sortOrder?: number,
	): MarkdownPostProcessor;
}

/**
 * A post processor receives an element which is a section of the preview.
 *
 * Post processors can mutate the DOM to render various things, such as mermaid graphs, latex equations, or custom controls.
 *
 * If your post processor requires lifecycle management, for example, to clear an interval, kill a subprocess, etc when this element is
 * removed from the app, look into {@link MarkdownPostProcessorContext.addChild}
 * @public
 * @since 0.10.12
 */
export interface MarkdownPostProcessor {
	/**
	 * The processor function itself.
	 * @public
	 */
	(el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<any> | undefined;

	/**
	 * An optional integer sort order. Defaults to 0. Lower number runs before higher numbers.
	 * @public
	 */
	sortOrder?: number;
}

/**
 * The context of the Markdown post processor.
 * @public
 */
export interface MarkdownPostProcessorContext {
	/**
	 * A random ID given to a specific rendering of this entire document, to uniquely identify it within the current running app instance.
	 * @public
	 */
	docId: string;

	/**
	 * The path to the associated file. Any links are assumed to be relative to the `sourcePath`.
	 * @public
	 */
	sourcePath: string;

	/**
	 * The frontmatter of the document.
	 * @public
	 */
	frontmatter: any | null | undefined;

	/**
	 * Adds a child component that will have its lifecycle managed by the renderer.
	 *
	 * Use this to add a dependent child to the renderer such that if the containerEl
	 * of the child is ever removed, the component's unload will be called.
	 * @param child The child component.
	 * @public
	 */
	addChild(child: MarkdownRenderChild): void;

	/**
	 * Gets the section information of this element at this point in time.
	 * Only call this function right before you need this information to get the most up-to-date version.
	 * This function may also return `null` in many circumstances; if you use it, you must be prepared to deal with `null`s.
	 * @param el The element.
	 * @public
	 */
	getSectionInfo(el: HTMLElement): MarkdownSectionInformation | null;
}

/**
 * Markdown section information.
 * @public
 */
export interface MarkdownSectionInformation {
	/**
	 * The text of the section.
	 * @public
	 */
	text: string;

	/**
	 * The start line of the section (0-based).
	 * @public
	 */
	lineStart: number;

	/**
	 * The end line of the section (0-based).
	 * @public
	 */
	lineEnd: number;
}

/**
 * A component to register as a child component for the Markdown preview.
 * @public
 */
export class MarkdownRenderChild extends Component {
	/**
	 * The container element.
	 * @public
	 */
	containerEl: HTMLElement;

	/**
	 * @param containerEl This HTMLElement will be used to test whether this component is still alive.
	 * It should be a child of the Markdown preview sections, and when it's no longer attached
	 * (for example, when it is replaced with a new version because the user edited the Markdown source code),
	 * this component will be unloaded.
	 * @public
	 */
	constructor(containerEl: HTMLElement) {
		super();
		this.containerEl = containerEl;
	}
}
