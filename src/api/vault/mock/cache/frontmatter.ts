import { Reference } from "./types.js";

/**
 * The frontmatter of the note.
 * ```markdown
 * ---
 * key1: "value1"
 * key2: 42
 * ---
 * ```
 * @public
 */
export interface FrontMatterCache {
    /**
     * The frontmatter properties.
     * @example
     * ```ts
     * console.log(frontmatterCache['key1']); // value1
     * console.log(frontmatterCache['key2']); // 42
     * ```
     * @public
     */
    [key: string]: any;
}

/**
 * A link in the frontmatter.
 * ```markdown
 * ---
 * key1: "[[wikilink]]"
 * key2: "[[wikilink|alias]]"
 * ---
 * ```
 * @public
 */
export interface FrontmatterLinkCache extends Reference {
    /**
     * The frontmatter property that contains the link.
     * @example
     * ```ts
     * console.log(frontmatterLinkCache.key); // key1
     * console.log(frontmatterLinkCache.key); // key2
     * ```
     * @public
     */
    key: string;
}

/**
 * Given the contents of a file, get information about the frontmatter of the file, including
 * whether there is a frontmatter block, the offsets of where it starts and ends, and the frontmatter text.
 * @example
 * ```ts
 * const content = `---
 * key1: value1
 * key2: value2
 * ---
 * main content
 * `;
 * console.log(getFrontMatterInfo(content));
 * ```
 * @public
 * @since 1.5.7
 */
export function getFrontMatterInfo(content: string): FrontMatterInfo {
    throw new Error("Method not implemented.");
}

/**
 * Information about the frontmatter of a note.
 * @public
 */
export interface FrontMatterInfo {
    /**
     * Whether this file has a frontmatter block.
     * @public
     */
    exists: boolean;
    /**
     * String representation of the frontmatter.
     * @public
     */
    frontmatter: string;
    /**
     * Start offset of the frontmatter contents (excluding the ---).
     * @public
     */
    from: number;
    /**
     * End offset of the frontmatter contents (excluding the ---).
     * @public
     */
    to: number;
    /**
     * Offset where the frontmatter block ends (including the ---).
     * @public
     */
    contentStart: number;
}
