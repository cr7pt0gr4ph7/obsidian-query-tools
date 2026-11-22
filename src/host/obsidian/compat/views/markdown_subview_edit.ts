import type { App } from "../../app.js";
import type { TFile } from "../../files/files.js";
import type { HoverParent, HoverPopover } from "../extensions/hover.js";
import type { MarkdownView } from "./markdown.js";
import type { MarkdownFileInfo } from "./markdown_file.js";
import type { MarkdownSubView } from "./markdown_subview.js";

/**
 * This is the editor for Obsidian Mobile as well as the WYSIWYG editor.
 * @public
 */
export class MarkdownEditView implements MarkdownSubView, HoverParent, MarkdownFileInfo {
	/**
	 * The app instance.
	 * @public
	 */
	app: App;

	/**
	 * @inheritDoc
	 * @public
	 */
	hoverPopover: HoverPopover;

	/**
	 * @param view The Markdown view.
	 * @public
	 */
	constructor(view: MarkdownView) {
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
	 * The file being edited.
	 * @public
	 */
	get file(): TFile {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the selected text.
	 * @public
	 */
	getSelection(): string {
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
