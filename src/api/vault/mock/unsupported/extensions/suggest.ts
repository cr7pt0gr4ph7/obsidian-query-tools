import type { EditorSuggest } from "../editor.js";

export interface IEditorSuggestPlugin_ {
	/**
	 * Register an EditorSuggest which can provide live suggestions while the user is typing.
	 * @param editorSuggest The editor suggest.
	 * @public
	 * @since 0.12.7
	 */
	registerEditorSuggest(editorSuggest: EditorSuggest<any>): void;
}
