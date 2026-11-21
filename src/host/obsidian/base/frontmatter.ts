import { parseDocument, stringify } from "yaml";

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
export function parseFrontMatterAliases(frontmatter: unknown | null): string[] | null {
	return parseFrontMatterStringArray(frontmatter, "aliases");
}

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
export function parseFrontMatterEntry(frontmatter: unknown | null, key: string | RegExp): unknown | null {
	if (typeof frontmatter !== "object" || frontmatter === null || Array.isArray(frontmatter)) return null;
	const record = frontmatter as Record<string, unknown>;
	if (typeof key === "string") {
		return Object.hasOwn(record, key) ? record[key] : null;
	}
	for (const name of Object.keys(record)) {
		key.lastIndex = 0;
		if (key.test(name)) return record[name];
	}
	return null;
}

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
export function parseFrontMatterStringArray(frontmatter: unknown | null, key: string | RegExp): string[] | null {
	const value = parseFrontMatterEntry(frontmatter, key);
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed ? [trimmed] : [];
	}
	if (!Array.isArray(value)) return null;
	return value
		.filter((entry): entry is string => typeof entry === "string")
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

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
export function parseFrontMatterTags(frontmatter: unknown | null): string[] | null {
	const tags = parseFrontMatterStringArray(frontmatter, "tags");
	if (tags === null) return null;
	return tags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

/**
 * Parses a YAML string into an object.
 * @param yaml The YAML string.
 * @returns The parsed YAML value.
 * @public
 */
export function parseYaml(yaml: string): unknown {
	const document = parseDocument(yaml);
	if (document.errors.length > 0) throw document.errors[0];
	return document.toJS({ maxAliasCount: 100 });
}

/**
 * Converts an object to a YAML string.
 * @param obj The object.
 * @returns The serialized YAML string.
 * @public
 */
export function stringifyYaml(obj: unknown): string {
	return stringify(obj);
}
