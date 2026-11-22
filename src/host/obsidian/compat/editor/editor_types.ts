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
