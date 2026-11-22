import type { App } from "../../app.js";
import type { TFile } from "../../files/files.js";
import type { Editor } from "./editor.js";
import type { EditorPosition } from "./editor_types.js";
import { type Instruction, PopoverSuggest } from "./suggest.js";

/**
 * Provides autocomplete suggestions in the editor.
 * @public
 * @since 0.12.17
 */
export abstract class EditorSuggest<T> extends PopoverSuggest<T> {
	/**
	 * Current suggestion context, containing the result of `onTrigger`.
	 * This will be `null` any time the `EditorSuggest` is not supposed to run.
	 * @public
	 * @since 0.12.17
	 */
	context: EditorSuggestContext | null;

	/**
	 * Override this to use a different limit for suggestion items.
	 * @public
	 * @since 0.12.17
	 */
	limit: number;

	/**
	 * @param app The app instance.
	 * @public
	 */
	constructor(app: App) {
		super(app);
		this.context = null;
		this.limit = 10;
	}

	/**
	 * Set the instructions for the suggestion.
	 * @param instructions The instructions.
	 * @public
	 * @since 0.13.0
	 */
	setInstructions(instructions: Instruction[]): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Based on the editor line and cursor position, determine if this EditorSuggest should be triggered at this moment.
	 * Typically, you would run a regular expression on the current line text before the cursor.
	 * Return `null` to indicate that this editor suggest is not supposed to be triggered.
	 *
	 * Please be mindful of performance when implementing this function, as it will be triggered very often (on each keypress).
	 * Keep it simple, and return `null` as early as possible if you determine that it is not the right time.
	 * @param cursor The cursor position.
	 * @param editor The editor.
	 * @param file The file being edited.
	 * @example
	 * ```ts
	 * class MyEditorSuggest extends EditorSuggest<string> {
	 *     public override onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null {
	 *         const match = editor.getLine(cursor.line).slice(0, cursor.ch).match(/@(\w*)$/);
	 *         if (!match) {
	 *             return null;
	 *         }
	 *         return {
	 *             start: { line: cursor.line, ch: cursor.ch - match[0].length },
	 *             end: cursor,
	 *             query: match[1] ?? '',
	 *         };
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 1.1.13
	 */
	abstract onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null;

	/**
	 * Generate suggestion items based on this context. Can be async, but preferably sync.
	 * When generating async suggestions, you should pass the context along.
	 * @param context The suggestion context.
	 * @example
	 * ```ts
	 * class MyEditorSuggest extends EditorSuggest<string> {
	 *     public override getSuggestions(context: EditorSuggestContext): string[] {
	 *         return ['Item 1', 'Item 2', 'Item 3'];
	 *     }
	 * }
	 * ```
	 * @example
	 * ```ts
	 * class MyEditorSuggest extends EditorSuggest<string> {
	 *     public override getSuggestions(context: EditorSuggestContext): Promise<string[]> {
	 *         return Promise.resolve(['Item 1', 'Item 2', 'Item 3']);
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 0.12.17
	 */
	abstract getSuggestions(context: EditorSuggestContext): T[] | Promise<T[]>;
}

/**
 * The context of the suggestion.
 * @public
 * @since 0.12.17
 */
export interface EditorSuggestContext extends EditorSuggestTriggerInfo {
	/**
	 * The editor.
	 * @public
	 */
	editor: Editor;

	/**
	 * The file being edited.
	 * @public
	 */
	file: TFile;
}

/**
 * The trigger info for the suggestion.
 * @public
 * @since 0.12.17
 */
export interface EditorSuggestTriggerInfo {
	/**
	 * The start position of the triggering text. This is used to position the popover.
	 * @public
	 */
	start: EditorPosition;

	/**
	 * The end position of the triggering text. This is used to position the popover.
	 * @public
	 */
	end: EditorPosition;

	/**
	 * They query string (usually the text between start and end) that will be used to generate the suggestion content.
	 * @public
	 */
	query: string;
}
