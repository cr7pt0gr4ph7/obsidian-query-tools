/**
 * Normalizes a path: uses forward slashes, removes duplicate, leading and trailing slashes,
 * replaces non-breaking spaces with regular spaces, and applies Unicode NFC normalization.
 * @param path The path.
 * @example
 * ```ts
 * normalizePath('foo/bar'); // foo/bar
 * normalizePath('/foo/bar'); // foo/bar
 * normalizePath('foo/bar/'); // foo/bar
 * normalizePath('foo//bar'); // foo/bar
 * normalizePath('foo\\bar'); // foo/bar
 * normalizePath('foo\u00A0bar'); // foo bar
 * normalizePath('foo\u202Fbar'); // foo bar
 * ```
 * @public
 */
export function normalizePath(path: string): string;

/**
 * Parses the linktext of a wikilink into its component parts.
 * @param linktext A wikilink without the leading [[ and trailing ]].
 * @returns The file path and subpath (subpath can refer either to a block id, or a heading).
 * @example
 * ```ts
 * console.log(parseLinktext('foo')); // { path: 'foo', subpath: '' }
 * console.log(parseLinktext('foo#bar')); // { path: 'foo', subpath: '#bar' }
 * ```
 * @public
 */
export function parseLinktext(linktext: string): {
	/**
	 * @public
	 */
	path: string;

	/**
	 * @public
	 */
	subpath: string;
};

/**
 * Converts link text to a link path.
 * @param linktext A wikilink without the leading `[[` and trailing `]]`.
 * @returns The name of the file that is being linked to.
 * @example
 * ```ts
 * console.log(getLinkpath('foo#bar')); // foo
 * ```
 * @public
 */
export function getLinkpath(linktext: string): string {
	return linktext.split("#", 1)[0] ?? "";
}

/**
 * Normalizes headings for link matching by stripping out special characters and shrinking consecutive spaces.
 * @param heading The heading.
 * @example
 * ```ts
 * console.log(stripHeading('foo!"#$%&()*+,.:;<=>?@^`{|}~\/\[\]\\\r\nbar')); // foo bar
 * ```
 * @public
 */
export function stripHeading(heading: string): string;

/**
 * Prepares headings for linking by stripping out some bad combinations of special characters that could break links.
 * @param heading The heading.
 * @example
 * ```ts
 * console.log(stripHeadingForLink('foo:#|^\\\r\n%%[[]]bar')); // foo bar
 * ```
 * @public
 */
export function stripHeadingForLink(heading: string): string;
