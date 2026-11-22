import type { EditorSuggest } from "../../../../api/vault/mock/unsupported/editor.js";

export interface IEditorSuggestPluginRegistry {
	/**
	 * Register an EditorSuggest which can provide live suggestions while the user is typing.
	 * @param editorSuggest The editor suggest.
	 * @public
	 * @since 0.12.7
	 */
	registerEditorSuggest(editorSuggest: EditorSuggest<any>): void;
}

export function EditorSuggestPluginRegistry<Base extends new (...args: any[]) => any>(Base: Base) {
	return class extends Base implements IEditorSuggestPluginRegistry {
		_editorSuggests: EditorSuggest<any>[] = [];

		registerEditorSuggest(editorSuggest: EditorSuggest<any>): void {
			this._editorSuggests.push(editorSuggest);
		}
	};
}
