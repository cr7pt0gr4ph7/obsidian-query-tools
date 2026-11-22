import { placeholder } from "../../placeholder.internal.js";
import type { Editor } from "../editor/editor.js";
import type { HoverPopover } from "../extensions/hover.js";
import type { WorkspaceLeaf } from "../workspace/leaf.js";
import type { MarkdownFileInfo } from "./markdown_file.js";
import type { MarkdownSubView } from "./markdown_subview.js";
import type { MarkdownPreviewView } from "./markdown_subview_preview.js";
import { TextFileView } from "./text.js";

/**
 * A view for Markdown files.
 * @public
 */
export class MarkdownView extends TextFileView implements MarkdownFileInfo {
	/**
	 * The editor.
	 * @public
	 */
	editor: Editor;

	/**
	 * The preview mode.
	 * @public
	 */
	previewMode: MarkdownPreviewView;

	/**
	 * The current mode.
	 * @public
	 */
	currentMode: MarkdownSubView;

	/**
	 * @inheritDoc
	 * @public
	 */
	hoverPopover: HoverPopover | null;

	/**
	 * @inheritDoc
	 * @public
	 */
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.editor = placeholder;
		this.previewMode = placeholder;
		this.currentMode = placeholder;
		this.hoverPopover = null;
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getViewType(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the current mode of the Markdown view.
	 * @public
	 */
	getMode(): MarkdownViewModeType {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getViewData(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	clear(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	setViewData(data: string, clear: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Show the search bar in the current mode.
	 * @param replace Whether to also show the replace field.
	 * @public
	 */
	showSearch(replace?: boolean): void {
		throw new Error("Method not implemented.");
	}
}

/**
 * The mode of the Markdown view.
 * @public
 */
export type MarkdownViewModeType = "source" | "preview";
