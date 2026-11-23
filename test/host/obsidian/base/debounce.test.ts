import assert from "node:assert/strict";
import { test } from "node:test";
import { debounce } from "../../../../src/host/obsidian/base/debounce.ts";

test("debounce resets the timer and runs the latest arguments", async () => {
	const calls: string[] = [];
	const debounced = debounce((value: string) => calls.push(value), 25, true);

	debounced("first");
	await new Promise((resolve) => setTimeout(resolve, 10));
	debounced("latest");
	await new Promise((resolve) => setTimeout(resolve, 35));

	assert.deepEqual(calls, ["latest"]);
	assert.equal(debounced.cancel(), debounced);
});

test("debounce without timer reset keeps the first scheduled time", async () => {
	const calls: string[] = [];
	const debounced = debounce((value: string) => calls.push(value), 30, false);

	debounced("first");
	await new Promise((resolve) => setTimeout(resolve, 10));
	debounced("latest");
	await new Promise((resolve) => setTimeout(resolve, 25));

	assert.deepEqual(calls, ["latest"]);
});

test("run invokes pending work immediately and cancel prevents it", () => {
	const calls = 0;
	const debounced = debounce((value: number) => calls + value, 1000);

	assert.equal(debounced.run(), undefined);
	assert.equal(debounced(4).run(), 4);
	assert.equal(debounced(9).cancel().run(), undefined);
	assert.equal(calls, 0);
});
