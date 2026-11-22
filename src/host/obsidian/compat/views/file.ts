import type { TFile } from "../../files/files.js";
import type { WorkspaceLeaf } from "../workspace/leaf.js";
import { ItemView } from "./item.js";
import type { ViewStateResult } from "./view.js";

/**
 * A view that works with a file. If the view displays the file, then it should use EditableFileView (or a descendant of it).
 * @public
 */
export abstract class FileView extends ItemView {
	/**
	 * Whether the view may be run without an attached file.
	 * @public
	 */
	allowNoFile: boolean = false;

	/**
	 * The file being viewed.
	 * @public
	 */
	file: TFile | null = null;

	/**
	 * Whether the view should get replaced when following a link (`true` by default).
	 * @inheritDoc
	 * @public
	 */
	navigation: boolean = true;

	/**
	 * @inheritDoc
	 * @public
	 */
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getDisplayText(): string {
		return this.file?.name ?? "";
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	onload(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getState(): Record<string, unknown> {
		return super.getState();
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 0.9.7
	 */
	setState(state: any, result: ViewStateResult): Promise<void> {
		return super.setState(state, result);
	}

	/**
	 * Called when the file is loaded.
	 * @param file The file.
	 * @public
	 */
	async onLoadFile(file: TFile): Promise<void> {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Called when the file is unloaded.
	 * @param file The file.
	 * @public
	 */
	async onUnloadFile(file: TFile): Promise<void> {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Called when the file is renamed.
	 * @param file The file.
	 * @public
	 */
	async onRename(file: TFile): Promise<void> {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Whether this file view can open a file with a specified extension.
	 * @param extension The file extension, without the leading dot.
	 * @public
	 * @since 0.9.7
	 */
	canAcceptExtension(extension: string): boolean {
		// Ignored, as this is a stub implementation.
		// The stub implementation always returns false, indicating that no extensions are accepted.
		return false;
	}
}

/**
 * A file view whose title can be edited to rename the file. Its content may be read-only, as in the image and PDF views.
 * @public
 * @since 0.9.7
 */
export abstract class EditableFileView extends FileView {}
