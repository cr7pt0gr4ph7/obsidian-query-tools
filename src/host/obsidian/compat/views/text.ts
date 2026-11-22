import { debounce } from "../../base/debounce.js";
import type { TFile } from "../../files/files.js";
import type { WorkspaceLeaf } from "../workspace/leaf.js";
import { EditableFileView } from "./file.js";

/**
 * This class implements a plaintext-based editable file view, which can be loaded and saved given an editor.
 *
 * Note that by default, this view only saves when it's closing. To implement auto-save, your editor should
 * call `this.requestSave()` when the content is changed.
 * @public
 * @since 0.10.12
 */
export abstract class TextFileView extends EditableFileView {
	/**
	 * In-memory data.
	 * @public
	 * @since 0.10.12
	 */
	data: string = "";

	/**
	 * Request a save, debounced by 2 seconds.
	 * @public
	 * @since 0.10.12
	 */
	requestSave: () => void;

	/** @internal */
	file: TFile | null = null;

	/**
	 * @inheritDoc
	 * @public
	 */
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.requestSave = debounce(() => this.save(), 2000);
	}

	/**
	 * Called when the file is unloaded. Saves any unsaved changes first.
	 * @param file The file.
	 * @public
	 * @since 0.10.12
	 */
	async onUnloadFile(file: TFile): Promise<void> {
		this.file = file;
		await this.save();
	}

	/**
	 * Called when the file is loaded. Reads the file and passes its contents to {@link TextFileView.setViewData}.
	 * @param file The file.
	 * @public
	 * @since 0.10.12
	 */
	async onLoadFile(file: TFile): Promise<void> {
		this.file = file;
		this.setViewData(await this.app.vault.read(this.file), true);
	}

	/**
	 * Save the file.
	 * @param clear Whether to clear the view after saving.
	 * @public
	 * @since 0.10.12
	 */
	async save(clear?: boolean): Promise<void> {
		if (!this.file) {
			return;
		}
		await this.app.vault.modify(this.file, this.getViewData());
		if (clear) {
			this.clear();
		}
	}

	/**
	 * Gets the data from the editor. This will be called to save the editor contents to the file.
	 * @public
	 * @since 0.10.12
	 */
	abstract getViewData(): string;

	/**
	 * Set the data to the editor. This is used to load the file contents.
	 *
	 * If `clear` is set, then it means we're opening a completely different file.
	 * In that case, you should call {@link TextFileView.clear}(), or implement a slightly more efficient
	 * clearing mechanism given the new data to be set.
	 * @param data The data.
	 * @param clear Whether a different file is being opened.
	 * @public
	 * @since 0.10.12
	 */
	abstract setViewData(data: string, clear: boolean): void;

	/**
	 * Clear the editor. This is usually called when we're about to open a completely
	 * different file, so it's best to clear any editor states like undo-redo history,
	 * and any caches/indexes associated with the previous file contents.
	 * @public
	 * @since 0.10.12
	 */
	abstract clear(): void;
}
