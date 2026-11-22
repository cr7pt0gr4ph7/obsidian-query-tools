import type { TFile } from "../../files/files.js";
import { type MarkdownPreviewEvents, MarkdownRenderer } from "./markdown_renderer.js";
import type { MarkdownSubView } from "./markdown_subview.js";

/**
 * The reading mode of a {@link MarkdownView}.
 * @public
 */
export class MarkdownPreviewView extends MarkdownRenderer implements MarkdownSubView, MarkdownPreviewEvents {
	/**
	 * The container element.
	 * @public
	 */
	declare containerEl: HTMLElement;

	/**
	 * The file being previewed.
	 * @public
	 */
	get file(): TFile {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the Markdown content.
	 * @public
	 */
	get(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the Markdown content.
	 * @param data The content.
	 * @param clear Whether to clear first.
	 * @public
	 */
	set(data: string, clear: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Clear the content.
	 * @public
	 */
	clear(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Force the preview to rerender.
	 * @param full Whether to rerender the entire preview or just the changed parts.
	 * @public
	 */
	rerender(full?: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the scroll position.
	 * @public
	 */
	getScroll(): number {
		throw new Error("Method not implemented.");
	}

	/**
	 * Apply a scroll position.
	 * @param scroll The scroll position.
	 * @public
	 */
	applyScroll(scroll: number): void {
		throw new Error("Method not implemented.");
	}
}
