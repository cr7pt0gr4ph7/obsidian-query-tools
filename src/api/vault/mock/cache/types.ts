/**
 * Location within a Markdown document.
 * @public
 */
export interface Loc {
    /**
     * Line number. 0-based.
     * @public
     */
    line: number;
    /**
     * Column number. 0-based.
     * @public
     */
    col: number;
    /**
     * Number of characters from the beginning of the file.
     * @public
     */
    offset: number;
}

/**
 * Describes a text range in a Markdown document.
 * @public
 */
export interface Pos {
    /**
     * Starting location.
     * @public
     */
    start: Loc;
    /**
     * End location.
     * @public
     */
    end: Loc;
}

/**
 * A cache item with a position within a note.
 * @public
 */
export interface CacheItem {
	/**
	 * Position of this item in the note.
	 * @public
	 */
	position: Pos;
}

/**
 * Base interface for items that point to a different location.
 * @public
 */
export interface Reference {
    /**
     * Link destination.
     * @public
     */
    link: string;
    /**
     * Contains the text as it's written in the document. Not available on Publish.
     * @public
     */
    original: string;
    /**
     * Display text of the link.
     * @example
     * For the following links:
     * ```md
     * [[foo|bar]]
     * [[foo]]
     * [foo](bar.md)
     * ![](bar.jpg)
     * ```
     * `displayText` will be:
     * ```
     * 'bar'
     * 'foo'
     * 'foo'
     * ''
     * ```
     * @public
     */
    displayText?: string;
}

/**
 * The result of resolving a subpath.
 * @public
 */
export interface SubpathResult {
	/**
	 * The start of the subpath.
	 * @public
	 */
	start: Loc;
	/**
	 * The end of the subpath.
	 * @public
	 */
	end: Loc | null;
}

/**
 * All possible types that can be emitted from parsing or writing to frontmatter.
 * @public
 */
export type FrontmatterValue =
    | string
    | number
    | boolean
    | undefined
    | null
    | {
            /** @public */
            [key: string]: FrontmatterValue;
      }
    | Array<FrontmatterValue>;
