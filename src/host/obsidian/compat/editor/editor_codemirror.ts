import { placeholder } from "../../placeholder.internal.js";
import type { StateField } from "../codemirror/state.js";
import type { EditorView, ViewPlugin } from "../codemirror/view.js";
import type { MarkdownFileInfo } from "../views/markdown.js";

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

/**
 * CodeMirror {@link ViewPlugin} for Live Preview.
 * @public
 */
export const livePreviewState: ViewPlugin<LivePreviewStateType, undefined> = placeholder;

/**
 * The object stored in the view plugin {@link livePreviewState}.
 * @public
 */
export interface LivePreviewStateType {
    /**
     * Whether the left mouse is currently held down in the editor
     * (for example, when drag-to-select text).
     * @public
     */
    mousedown: boolean;
}
