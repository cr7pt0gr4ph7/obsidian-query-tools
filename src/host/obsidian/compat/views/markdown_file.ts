import type { App } from "../../app.js";
import type { TFile } from "../../files/files.js";
import type { Editor } from "../editor/editor.js";
import type { HoverParent } from "../extensions/hover.js";

/**
 * Information about a Markdown editor, such as its file and its editor.
 * @public
 */
export interface MarkdownFileInfo extends HoverParent {
	/**
	 * The app instance.
	 * @public
	 */
	app: App;

	/**
	 * The associated file.
	 * @public
	 */
	get file(): TFile | null;

	/**
	 * The editor, if there is one.
	 * @public
	 */
	editor?: Editor;
}
