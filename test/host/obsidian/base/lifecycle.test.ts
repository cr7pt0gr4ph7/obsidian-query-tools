import assert from "node:assert/strict";
import { test } from "node:test";
import { Events } from "../../../../src/host/obsidian/base/events.js";
import { Component } from "../../../../src/host/obsidian/base/lifecycle.js";

test("component load and unload are idempotent and manage overrides", () => {
	class TestComponent extends Component {
		loadCount = 0;
		unloadCount = 0;

		override onload(): void {
			this.loadCount++;
		}

		override onunload(): void {
			this.unloadCount++;
		}
	}

	const component = new TestComponent();
	component.load();
	component.load();
	assert.equal(component.loadCount, 1);
	component.unload();
	component.unload();
	assert.equal(component.unloadCount, 1);
	component.load();
	component.unload();
	assert.equal(component.loadCount, 2);
	assert.equal(component.unloadCount, 2);
});

test("children are loaded and unloaded with their parent", () => {
	class TestComponent extends Component {
		active = false;
		override onload(): void {
			this.active = true;
		}
		override onunload(): void {
			this.active = false;
		}
	}

	const parent = new TestComponent();
	const child = parent.addChild(new TestComponent());
	assert.equal(child.active, false);
	parent.load();
	assert.equal(child.active, true);
	parent.removeChild(child);
	assert.equal(child.active, false);
	parent.load();
	assert.equal(child.active, false);
});

test("registered cleanup callbacks run once in reverse order", () => {
	const component = new Component();
	const calls: string[] = [];
	component.register(() => calls.push("first"));
	component.register(() => calls.push("second"));
	component.load();
	component.unload();
	component.unload();
	assert.deepEqual(calls, ["second", "first"]);
});

test("event references and DOM listeners are detached on unload", () => {
	const emitter = new Events();
	let eventCalls = 0;
	const component = new Component();
	const eventRef = emitter.on("changed", () => eventCalls++);
	component.registerEvent(eventRef);

	const listeners = new Map<string, EventListener>();
	const element = {
		addEventListener(type: string, callback: EventListener) {
			listeners.set(type, callback);
		},
		removeEventListener(type: string) {
			listeners.delete(type);
		},
	};
	component.registerDomEvent(element as unknown as HTMLElement, "click", () => undefined);

	component.load();
	emitter.trigger("changed");
	assert.equal(eventCalls, 1);
	assert.equal(listeners.has("click"), true);
	component.unload();
	emitter.trigger("changed");
	assert.equal(eventCalls, 1);
	assert.equal(listeners.has("click"), false);
});

test("registered intervals are cleared on unload", () => {
	const component = new Component();
	const id = setInterval(() => undefined, 60_000);
	const intervalId = id as unknown as number;
	assert.equal(component.registerInterval(intervalId), intervalId);
	component.load();
	component.unload();
	clearInterval(id);
});
