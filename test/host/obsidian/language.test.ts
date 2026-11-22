import assert from "node:assert/strict";
import { test } from "node:test";
import { getLanguage } from "../../../src/host/obsidian/language.js";

test("getLanguage returns en", () => {
	assert.equal(getLanguage(), "en");
});
