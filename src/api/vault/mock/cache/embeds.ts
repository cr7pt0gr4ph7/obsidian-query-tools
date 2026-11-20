import { ReferenceCache } from "./reference.js";

/**
 * An embed in the note.
 * ```markdown
 * ![[wikilink]]
 * ![[wikilink|alias]]
 * ![alias](markdown-link)
 * ```
 * @public
 * @since 0.9.7
 */
export interface EmbedCache extends ReferenceCache {}
