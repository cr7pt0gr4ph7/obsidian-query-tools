import assert from "node:assert/strict";
import { test } from "node:test";
import {
	parseFrontMatterAliases,
	parseFrontMatterEntry,
	parseFrontMatterStringArray,
	parseFrontMatterTags,
	parseYaml,
	stringifyYaml,
} from "../../../../src/host/obsidian/base/frontmatter.ts";

test("frontmatter entry lookup supports exact and regular-expression keys", () => {
	const frontmatter = { foo: "bar", baz: "qux" };
	assert.equal(parseFrontMatterEntry(frontmatter, "foo"), "bar");
	assert.equal(parseFrontMatterEntry(frontmatter, "missing"), null);
	assert.equal(parseFrontMatterEntry(frontmatter, /ba./), "qux");
	assert.equal(parseFrontMatterEntry(null, "foo"), null);
	assert.equal(parseFrontMatterEntry([], "foo"), null);
});

test("frontmatter string arrays trim and normalize aliases and tags", () => {
	assert.deepEqual(parseFrontMatterStringArray({ foo: " bar " }, "foo"), ["bar"]);
	assert.deepEqual(parseFrontMatterStringArray({ foo: [" bar ", "", 3, "baz"] }, "foo"), ["bar", "baz"]);
	assert.deepEqual(parseFrontMatterAliases({ aliases: [" First ", "Second"] }), ["First", "Second"]);
	assert.deepEqual(parseFrontMatterAliases({ aliases: " Third " }), ["Third"]);
	assert.equal(parseFrontMatterAliases(null), null);
	assert.deepEqual(parseFrontMatterTags({ tags: ["foo", "#bar", " baz "] }), ["#foo", "#bar", "#baz"]);
	assert.deepEqual(parseFrontMatterTags({ tags: "qux" }), ["#qux"]);
	assert.equal(parseFrontMatterTags({}), null);
});

test("YAML parsing and stringifying round-trip objects", () => {
	assert.deepEqual(parseYaml("name: Example\ncount: 2\nitems:\n  - one\n"), {
		name: "Example",
		count: 2,
		items: ["one"],
	});
	assert.throws(() => parseYaml("items: ["), /Flow sequence|end with a/);
	const yaml = stringifyYaml({ name: "Example", count: 2 });
	assert.deepEqual(parseYaml(yaml), { name: "Example", count: 2 });
});
