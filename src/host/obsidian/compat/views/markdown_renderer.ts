import type { App } from "../../app.js";
import type { Component } from "../../base/component.js";
import type { TFile } from "../../files/files.js";
import type { HoverParent, HoverPopover } from "../extensions/hover.js";
import {
	type MarkdownPostProcessor,
	type MarkdownPostProcessorContext,
	MarkdownRenderChild,
} from "../extensions/markdown.js";

/**
 * The renderer of the Markdown preview.
 * @public
 * @since 0.9.7
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Must be a class with static members for compatibility with the Obsidian API
export class MarkdownPreviewRenderer {
	/**
	 * Register a post processor.
	 * @param postProcessor The post processor.
	 * @param sortOrder The sort order. Determines when this post processor runs with respect to other post processors registered by the core and plugins.
	 * @public
	 * @since 0.10.12
	 */
	static registerPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Unregister a post processor.
	 * @param postProcessor The post processor.
	 * @public
	 * @since 0.9.7
	 */
	static unregisterPostProcessor(postProcessor: MarkdownPostProcessor): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a code block post processor.
	 * @param language The language of the code block.
	 * @param handler Renders the code block, given its source, the element to render into, and the context.
	 * @public
	 * @since 0.12.11
	 */
	static createCodeBlockPostProcessor(
		language: string,
		handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | undefined,
	): (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void {
		throw new Error("Method not implemented.");
	}
}

/**
 * The events of the Markdown preview.
 * @public
 */
export interface MarkdownPreviewEvents extends Component {}

/**
 * A renderer for Markdown.
 * @public
 * @since 0.9.7
 */
export abstract class MarkdownRenderer extends MarkdownRenderChild implements MarkdownPreviewEvents, HoverParent {
	/**
	 * The app instance.
	 * @public
	 */
	declare app: App;

	/**
	 * The active hover popover, managed by the Workspace.
	 * @public
	 */
	declare hoverPopover: HoverPopover | null;

	/**
	 * The file being rendered.
	 * @public
	 */
	abstract get file(): TFile;

	/**
	 * Renders Markdown string to an HTML element.
	 * @param markdown The Markdown source code.
	 * @param el The element to append to.
	 * @param sourcePath The normalized path of this Markdown file, used to resolve relative internal links.
	 * @param component A parent component to manage the lifecycle of the rendered child components.
	 * @public
	 * @deprecated - use {@link MarkdownRenderer.render}
	 * @since 0.10.6
	 */
	static renderMarkdown(markdown: string, el: HTMLElement, sourcePath: string, component: Component): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Renders Markdown string to an HTML element.
	 * @param app A reference to the app object.
	 * @param markdown The Markdown source code.
	 * @param el The element to append to.
	 * @param sourcePath The normalized path of this Markdown file, used to resolve relative internal links.
	 * @param component A parent component to manage the lifecycle of the rendered child components.
	 * @public
	 */
	static render(app: App, markdown: string, el: HTMLElement, sourcePath: string, component: Component): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
