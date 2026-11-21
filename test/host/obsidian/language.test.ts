import assert from "node:assert/strict";
import { test } from "node:test";
import { getLanguage } from "../../../src/host/obsidian/language.ts";

test("getLanguage returns English", () => {
	assert.equal(getLanguage(), "en");
});
