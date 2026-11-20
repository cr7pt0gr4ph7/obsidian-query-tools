import { ReferenceCache } from "./reference.js";

/**
 * A link in the note.
 * ```markdown
 * [[wikilink]]
 * [[wikilink|alias]]
 * [alias](markdown-link)
 * ```
 * @public
 * @since 0.9.7
 */
export interface LinkCache extends ReferenceCache {}
