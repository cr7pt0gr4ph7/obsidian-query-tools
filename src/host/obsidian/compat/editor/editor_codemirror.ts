import type { MarkdownFileInfo } from "../../../../api/vault/mock/unsupported/view.js";
import { placeholder } from "../../placeholder.internal.js";
import type { StateField } from "../codemirror/state.js";
import type { EditorView } from "../codemirror/view.js";


/**
 * Use this CodeMirror {@link StateField} to get a reference to the {@link EditorView}.
 * @public
 */
export const editorEditorField: StateField<EditorView> = placeholder;

/**
 * Use this CodeMirror {@link StateField} to get {@link MarkdownFileInfo} about this Markdown editor, such as the associated file, or the Editor.
 * @public
 */
export const editorInfoField: StateField<MarkdownFileInfo> = placeholder;

/**
 * This is now deprecated - it is now mapped directly to {@link editorInfoField}, which returns a {@link MarkdownFileInfo}, which may be a {@link MarkdownView} but not necessarily.
 * @public
 * @deprecated use {@link editorInfoField} instead.
 */
export const editorViewField: StateField<MarkdownFileInfo> = editorInfoField;

/**
 * Use this CodeMirror {@link StateField} to check whether Live Preview is active.
 * @public
 */
export const editorLivePreviewField: StateField<boolean> = placeholder;
