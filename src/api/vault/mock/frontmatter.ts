/**
 * Gets the aliases from the frontmatter object.
 * @param frontmatter The frontmatter object.
 * @returns The aliases, or `null` if there are none.
 * @example
 * ```ts
 * console.log(parseFrontMatterAliases({ aliases: ['foo', 'bar'] })); // ['foo', 'bar']
 * console.log(parseFrontMatterAliases({ aliases: 'baz' })); // ['baz']
 * ```
 * @public
 */
export function parseFrontMatterAliases(frontmatter: any | null): string[] | null;

/**
 * Gets an entry from the frontmatter object.
 * @param frontmatter The frontmatter object.
 * @param key The key, or a pattern to match keys against.
 * @returns The value, or `null` if the key is not found.
 * @example
 * ```ts
 * console.log(parseFrontMatterEntry({ foo: 'bar' }, 'foo')); // bar
 * console.log(parseFrontMatterEntry({ baz: 'qux' }, /ba./)); // qux
 * ```
 * @public
 */
export function parseFrontMatterEntry(frontmatter: any | null, key: string | RegExp): any | null;

/**
 * Parses a frontmatter entry as an array of strings. A single string value is returned as a one-element array.
 * @param frontmatter The frontmatter object.
 * @param key The key, or a pattern to match keys against.
 * @returns The trimmed string values, or `null` if the key is not found.
 * @example
 * ```ts
 * console.log(parseFrontMatterStringArray({ foo: ['bar', 'baz'] }, 'foo')); // ['bar', 'baz']
 * console.log(parseFrontMatterStringArray({ foo: 'bar baz' }, 'foo')); // ['bar baz']
 * console.log(parseFrontMatterStringArray({ foo: ['bar', 'baz'] }, /fo./)); // ['bar', 'baz']
 * ```
 * @public
 */
export function parseFrontMatterStringArray(frontmatter: any | null, key: string | RegExp): string[] | null;

/**
 * Gets the tags from the frontmatter object.
 * @param frontmatter The frontmatter object.
 * @returns The tags, or `null` if there are none.
 * @example
 * ```ts
 * console.log(parseFrontMatterTags({ tags: ['foo', '#bar'] })); // ['#foo', '#bar']
 * console.log(parseFrontMatterTags({ tags: 'baz' })); // ['#baz']
 * ```
 * @public
 */
export function parseFrontMatterTags(frontmatter: any | null): string[] | null;

/**
 * Parses a YAML string into an object.
 * @param yaml The YAML string.
 * @public
 */
export function parseYaml(yaml: string): any;

/**
 * Converts an object to a YAML string.
 * @param obj The object.
 * @public
 */
export function stringifyYaml(obj: any): string;
