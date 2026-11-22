import type {
	EditorChange,
	EditorPosition,
	EditorRange,
	EditorSelection,
	EditorSelectionOrCaret,
	EditorTransaction,
} from "./editor_types.js";

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
