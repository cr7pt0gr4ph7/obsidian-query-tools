import assert from "node:assert/strict";
import { suite, test } from "node:test";
import {
	getLinkpath,
	normalizePath,
	parseLinktext,
	stripHeading,
	stripHeadingForLink,
} from "../../../../src/host/obsidian/base/links.ts";

suite("Link utilities", () => {
	test("normalizePath canonicalizes separators, slash runs, whitespace, and Unicode", () => {
		assert.equal(normalizePath("/foo//bar\\baz/"), "foo/bar/baz");
		assert.equal(normalizePath("foo\u00a0bar"), "foo bar");
		assert.equal(normalizePath("Cafe\u0301"), "Café");
	});

	test("linktext parsing separates file paths and subpaths", () => {
		assert.deepEqual(parseLinktext("foo"), { path: "foo", subpath: "" });
		assert.deepEqual(parseLinktext("foo#Heading"), { path: "foo", subpath: "#Heading" });
		assert.deepEqual(parseLinktext("foo#^block"), { path: "foo", subpath: "#^block" });
		assert.equal(getLinkpath("foo#Heading"), "foo");
		assert.equal(getLinkpath("plain"), "plain");
	});

	test("heading helpers normalize text for matching and linking", () => {
		assert.equal(stripHeading("  foo!#$  bar  "), "foo bar");
		assert.equal(stripHeadingForLink("foo:#|^\\\r\n%%[[]]bar"), "foobar");
	});
});
