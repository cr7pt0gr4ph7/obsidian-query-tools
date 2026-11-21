import type { StateField } from "../../../../host/obsidian/compat/codemirror/state.js";
import type { EditorView } from "../../../../host/obsidian/compat/codemirror/view.js";
import type { TFile } from "../../../../host/obsidian/files/files.js";
import type { App } from "../app.js";
import type { Instruction } from "./modals.js";
import { placeholder } from "./placeholder.js";
import { PopoverSuggest } from "./suggest.js";
import type { MarkdownFileInfo } from "./view.js";

/**
 * This is now deprecated - it is now mapped directly to {@link editorInfoField}, which returns a {@link MarkdownFileInfo}, which may be a {@link MarkdownView} but not necessarily.
 * @public
 * @deprecated use {@link editorInfoField} instead.
 */
export const editorViewField: StateField<MarkdownFileInfo> = placeholder;

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
 * Use this CodeMirror {@link StateField} to check whether Live Preview is active.
 * @public
 */
export const editorLivePreviewField: StateField<boolean> = placeholder;

/**
 * The name of a command you can execute with {@link Editor.exec}.
 * @public
 */
export type EditorCommandName =
	| "goUp"
	| "goDown"
	| "goLeft"
	| "goRight"
	| "goStart"
	| "goEnd"
	| "goWordLeft"
	| "goWordRight"
	| "indentMore"
	| "indentLess"
	| "newlineAndIndent"
	| "swapLineUp"
	| "swapLineDown"
	| "deleteLine"
	| "toggleFold"
	| "foldAll"
	| "unfoldAll";

/**
 * A common interface that bridges the gap between CodeMirror 5 and CodeMirror 6.
 * @public
 * @since 0.11.11
 */
export abstract class Editor {
	/**
	 * @public
	 * @deprecated Use the editor directly. Kept for compatibility with CodeMirror 5.
	 * @since 0.11.11
	 */
	getDoc(): this {
		return this;
	}

	/**
	 * Force the editor to refresh and remeasure its content.
	 * @public
	 * @since 0.11.11
	 */
	abstract refresh(): void;

	/**
	 * Get the content of the editor.
	 * @public
	 * @since 0.11.11
	 */
	abstract getValue(): string;

	/**
	 * Set the content of the editor.
	 * @param content The content.
	 * @public
	 * @since 0.11.11
	 */
	abstract setValue(content: string): void;

	/**
	 * Get the text at line index (0-based).
	 * @param line The line index.
	 * @public
	 * @since 0.11.11
	 */
	abstract getLine(line: number): string;

	/**
	 * Set the text at line index (0-based).
	 * @param n The line index.
	 * @param text The text.
	 * @public
	 * @since 0.11.11
	 */
	setLine(n: number, text: string): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Gets the number of lines in the document.
	 * @public
	 * @since 0.11.11
	 */
	abstract lineCount(): number;

	/**
	 * Get the index of the last line (0-indexed).
	 * @public
	 * @since 0.11.11
	 */
	abstract lastLine(): number;

	/**
	 * Get the selected text.
	 * @public
	 * @since 0.11.11
	 */
	abstract getSelection(): string;

	/**
	 * Check if there is a selection.
	 * @public
	 * @since 0.11.11
	 */
	somethingSelected(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the text between two positions.
	 * @param from The start position.
	 * @param to The end position.
	 * @public
	 * @since 0.11.11
	 */
	abstract getRange(from: EditorPosition, to: EditorPosition): string;

	/**
	 * @public
	 * @since 0.11.11
	 */
	abstract replaceSelection(replacement: string, origin?: string): void;

	/**
	 * Replace the text between two positions.
	 * @param replacement The replacement text.
	 * @param from The start position.
	 * @param to The end position. If omitted, the text is inserted at `from`.
	 * @param origin The user event that triggered the replacement.
	 * @public
	 * @since 0.11.11
	 */
	abstract replaceRange(replacement: string, from: EditorPosition, to?: EditorPosition, origin?: string): void;

	/**
	 * Get the cursor position.
	 * @param side Which end of the main selection to get. Defaults to `'head'`.
	 * @public
	 * @since 0.11.11
	 */
	abstract getCursor(side?: "from" | "to" | "head" | "anchor"): EditorPosition;

	/**
	 * Get the list of selections if multiple cursors are active.
	 * @public
	 * @since 0.11.11
	 */
	abstract listSelections(): EditorSelection[];

	/**
	 * Set the cursor position.
	 * @param pos The position to set the cursor to, or a line number (0-based).
	 * @param ch The character index (0-based), if `pos` is a line number.
	 * @example
	 * ```ts
	 * editor.setCursor({ line: 12, ch: 3 });
	 * editor.setCursor(12, 3);
	 * ```
	 * @public
	 * @since 0.11.11
	 */
	setCursor(pos: EditorPosition | number, ch?: number): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the selection.
	 * @param anchor The position where the selection starts.
	 * @param head The position of the cursor. If omitted, the selection is a caret at `anchor`.
	 * @public
	 * @since 0.11.11
	 */
	abstract setSelection(anchor: EditorPosition, head?: EditorPosition): void;

	/**
	 * Set the selections.
	 * @param ranges The selections.
	 * @param main The index of the main selection.
	 * @example
	 * ```ts
	 * editor.setSelections([
	 *     { anchor: { line: 12, ch: 3 }, head: { line: 23, ch: 4 } },
	 *     { anchor: { line: 34, ch: 5 }, head: { line: 45, ch: 6 } }
	 * ], 1);
	 * ```
	 * @public
	 * @since 0.12.11
	 */
	abstract setSelections(ranges: EditorSelectionOrCaret[], main?: number): void;

	/**
	 * Focus the editor.
	 * @public
	 * @since 0.11.11
	 */
	abstract focus(): void;

	/**
	 * Blur the editor.
	 * @public
	 * @since 0.11.11
	 */
	abstract blur(): void;

	/**
	 * Check if the editor is focused.
	 * @public
	 * @since 0.11.11
	 */
	abstract hasFocus(): boolean;

	/**
	 * Get the scroll info (horizontal and vertical scroll positions).
	 * @public
	 * @since 0.11.11
	 */
	abstract getScrollInfo(): {
		/**
		 * @public
		 * @since 0.11.11
		 */
		top: number;

		/**
		 * @public
		 * @since 0.11.11
		 */
		left: number;
	};

	/**
	 * Scroll to a specific position.
	 * @param x The horizontal scroll position.
	 * @param y The vertical scroll position.
	 * @public
	 * @since 0.11.11
	 */
	abstract scrollTo(x?: number | null, y?: number | null): void;

	/**
	 * Scroll a range into view.
	 * @param range The range.
	 * @param center Whether to center the range.
	 * @public
	 * @since 0.13.0
	 */
	abstract scrollIntoView(range: EditorRange, center?: boolean): void;

	/**
	 * Undo the last action.
	 * @public
	 * @since 0.11.11
	 */
	abstract undo(): void;

	/**
	 * Redo the last action.
	 * @public
	 * @since 0.11.11
	 */
	abstract redo(): void;

	/**
	 * Execute a command.
	 * @param command The command.
	 * @public
	 * @since 0.12.2
	 */
	abstract exec(command: EditorCommandName): void;

	/**
	 * @public
	 * @since 0.13.0
	 */
	abstract transaction(tx: EditorTransaction, origin?: string): void;

	/**
	 * Get the word at a specific position.
	 * @param pos The position.
	 * @returns The range of the word, or `null` if there is no word at the position.
	 * @public
	 * @since 0.11.11
	 */
	abstract wordAt(pos: EditorPosition): EditorRange | null;

	/**
	 * Convert a position to an offset.
	 * @param pos The position.
	 * @public
	 * @since 0.11.11
	 */
	abstract posToOffset(pos: EditorPosition): number;

	/**
	 * Convert an offset to a position.
	 * @param offset The offset.
	 * @public
	 * @since 0.11.11
	 */
	abstract offsetToPos(offset: number): EditorPosition;

	/**
	 * Process every line covered by the current selections.
	 * `read` is called for each line first, then `write` is called for each line to produce its change.
	 * @param read Computes a value for a line.
	 * @param write Computes the change for a line, given its value. Return nothing to leave the line unchanged.
	 * @param ignoreEmpty Whether to skip empty lines when multiple lines are selected.
	 * @example
	 * ```ts
	 * editor.processLines(
	 *     (line, lineText) => lineText.startsWith('- '),
	 *     (line, lineText, isListItem) => isListItem ? undefined : { from: { line, ch: 0 }, text: '- ' },
	 * );
	 * ```
	 * @public
	 * @since 0.13.26
	 */
	processLines<T>(
		read: (line: number, lineText: string) => T | null,
		write: (line: number, lineText: string, value: T | null) => EditorChange | undefined,
		ignoreEmpty?: boolean,
	): void {
		throw new Error("Method not implemented.");
	}
}

/**
 * Represents a change to the editor.
 * @public
 * @since 0.12.11
 */
export interface EditorChange extends EditorRangeOrCaret {
	/**
	 * The replacement text.
	 * @public
	 */
	text: string;
}

/**
 * Represents a position in the editor.
 * @public
 * @since 0.12.11
 */
export interface EditorPosition {
	/**
	 * The line number (0-based).
	 * @public
	 */
	line: number;

	/**
	 * Index of the character on the line (0-based).
	 * @public
	 */
	ch: number;
}

/**
 * Represents a range in the editor.
 * @public
 * @since 0.12.11
 */
export interface EditorRange {
	/**
	 * The start position.
	 * @public
	 */
	from: EditorPosition;

	/**
	 * The end position.
	 * @public
	 */
	to: EditorPosition;
}

/**
 * Represents a range or caret in the editor.
 * @public
 * @since 0.12.11
 */
export interface EditorRangeOrCaret {
	/**
	 * The start position.
	 * @public
	 */
	from: EditorPosition;

	/**
	 * The end position. If omitted, this represents a caret at `from`.
	 * @public
	 */
	to?: EditorPosition;
}

/**
 * Scroll info for the editor.
 * @public
 * @since 0.15.0
 */
export interface EditorScrollInfo {
	/**
	 * The horizontal scroll position.
	 * @public
	 */
	left: number;

	/**
	 * The vertical scroll position.
	 * @public
	 */
	top: number;

	/**
	 * The total width of the scrollable content.
	 * @public
	 */
	width: number;

	/**
	 * The total height of the scrollable content.
	 * @public
	 */
	height: number;

	/**
	 * The width of the visible area of the editor.
	 * @public
	 */
	clientWidth: number;

	/**
	 * The height of the visible area of the editor.
	 * @public
	 */
	clientHeight: number;
}

/**
 * Represents a selection in the editor.
 * @public
 * @since 0.12.11
 */
export interface EditorSelection {
	/**
	 * The position where the selection started.
	 * @public
	 */
	anchor: EditorPosition;

	/**
	 * The position of the cursor, where the selection ends.
	 * @public
	 */
	head: EditorPosition;
}

/**
 * Represents a selection or caret in the editor.
 * @public
 * @since 0.12.11
 */
export interface EditorSelectionOrCaret {
	/**
	 * The position where the selection started.
	 * @public
	 */
	anchor: EditorPosition;

	/**
	 * The position of the cursor, where the selection ends. If omitted, this represents a caret at `anchor`.
	 * @public
	 */
	head?: EditorPosition;
}

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

/**
 * A set of changes to apply to the editor in one transaction.
 * @public
 */
export interface EditorTransaction {
	/**
	 * Text to replace the current selection with.
	 * @public
	 */
	replaceSelection?: string;

	/**
	 * The changes to apply.
	 * @public
	 */
	changes?: EditorChange[];

	/**
	 * List of selections for multiple cursors.
	 * @public
	 */
	selections?: EditorRangeOrCaret[];

	/**
	 * The new selection.
	 * @public
	 */
	selection?: EditorRangeOrCaret;
}
