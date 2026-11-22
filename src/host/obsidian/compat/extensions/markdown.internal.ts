import type { MarkdownPostProcessor, MarkdownPostProcessorContext } from "./markdown";

export interface IMarkdownProcessorPluginRegistry {
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

export interface IMarkdownPostProcessorRegistration {
	/** The post processor function. */
	readonly postProcessor: MarkdownPostProcessor;
	/** The sort order for this post processor. */
	readonly sortOrder?: number;
}

export interface IMarkdownCodeBlockProcessorRegistration {
	/** The code block language. */
	readonly language: string;
	/** The handler function for the code block. */
	readonly handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | undefined;
	/** The sort order for this code block processor. */
	readonly sortOrder?: number;
}

export function MarkdownProcessorPluginRegistry<TBase extends new (...args: any[]) => any>(Base: TBase) {
	return class extends Base implements IMarkdownProcessorPluginRegistry {
		_markdownPostProcessors: IMarkdownPostProcessorRegistration[] = [];
		_markdownCodeBlockProcessors: IMarkdownCodeBlockProcessorRegistration[] = [];

		registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): MarkdownPostProcessor {
			this._markdownPostProcessors.push({ postProcessor, sortOrder: sortOrder ?? postProcessor.sortOrder });
			return postProcessor;
		}

		registerMarkdownCodeBlockProcessor(
			language: string,
			handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | undefined,
			sortOrder?: number,
		): MarkdownPostProcessor {
			this._markdownCodeBlockProcessors.push({ language, handler, sortOrder });
			return (el, ctx) => handler("", el, ctx);
		}
	};
}
