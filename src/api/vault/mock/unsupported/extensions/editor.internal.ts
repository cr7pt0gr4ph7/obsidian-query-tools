import type { Extension } from "../../../../../host/obsidian/compat/codemirror/state.js";

export interface IEditorPluginRegistry {
	/**
	 * Registers a CodeMirror 6 extension.
	 * To reconfigure cm6 extensions for a plugin on the fly, an array should be passed in, and modified dynamically.
	 * Once this array is modified, calling {@link Workspace.updateOptions} will apply the changes.
	 * @param extension must be a CodeMirror 6 `Extension`, or an array of Extensions.
	 * @example
	 * ```ts
	 * const myViewPlugin = ViewPlugin.fromClass(MyViewPlugin);
	 * const myStateField = StateField.define<DecorationSet>(myStateFieldConfig);
	 * plugin.registerEditorExtension([myViewPlugin, myStateField]);
	 * ```
	 * @public
	 * @since 0.12.8
	 */
	registerEditorExtension(extension: Extension): void;
}

export function EditorPluginRegistry<TBase extends new (...args: any[]) => any>(Base: TBase) {
	return class extends Base implements IEditorPluginRegistry {
		_editorExtensions: Extension[] = [];

		registerEditorExtension(extension: Extension): void {
			this._editorExtensions.push(extension);
		}
	};
}
