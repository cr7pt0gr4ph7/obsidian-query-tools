import assert from "node:assert/strict";
import { test } from "node:test";
import { Tasks } from "../../../../src/host/obsidian/base/tasks.js";

test("Tasks starts callbacks immediately and tracks their completion", async () => {
	const tasks = new Tasks();
	let started = false;
	let resolveTask!: () => void;
	const pending = new Promise<void>((resolve) => {
		resolveTask = resolve;
	});

	tasks.add(() => {
		started = true;
		return pending;
	});
	assert.equal(started, true);
	assert.equal(tasks.isEmpty(), false);
	let waiting = false;
	const wait = tasks.promise().then(() => {
		waiting = true;
	});
	resolveTask();
	await wait;
	assert.equal(waiting, true);
	await Promise.resolve();
	assert.equal(tasks.isEmpty(), true);
});

test("Tasks tracks added promises and resolves an empty collection", async () => {
	const tasks = new Tasks();
	assert.equal(tasks.isEmpty(), true);
	await assert.doesNotReject(tasks.promise());

	let resolveTask!: (value: number) => void;
	tasks.addPromise(
		new Promise<number>((resolve) => {
			resolveTask = resolve;
		}),
	);
	assert.equal(tasks.isEmpty(), false);
	const waiting = tasks.promise();
	resolveTask(42);
	await assert.doesNotReject(waiting);
	await Promise.resolve();
	assert.equal(tasks.isEmpty(), true);
});

test("Tasks remains stable when a tracked promise rejects", async () => {
	const tasks = new Tasks();
	const rejected = Promise.reject(new Error("cleanup failed"));
	tasks.addPromise(rejected);
	assert.equal(tasks.isEmpty(), false);
	await assert.rejects(tasks.promise(), /cleanup failed/);
	await Promise.resolve();
	assert.equal(tasks.isEmpty(), true);
});
