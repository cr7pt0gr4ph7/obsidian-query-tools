import assert from "node:assert/strict";
import { test } from "node:test";
import { Notice } from "../../../../src/host/obsidian/compat/notice.ts";

test("Notice construction and methods do not throw", () => {
	assert.doesNotThrow(() => new Notice("hello"));
	assert.doesNotThrow(() => new Notice("hello", 0));

	const notice = new Notice("hello", 1000);
	assert.doesNotThrow(() => notice.setMessage("updated"));
	assert.equal(notice.setMessage("again"), notice);
	assert.doesNotThrow(() => notice.hide());
});
