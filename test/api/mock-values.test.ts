import assert from "node:assert/strict";
import { test } from "node:test";
import {
	BooleanValue,
	DateValue,
	DurationValue,
	FileValue,
	HTMLValue,
	IconValue,
	ImageValue,
	LinkValue,
	ListValue,
	NullValue,
	NumberValue,
	ObjectValue,
	RegExpValue,
	RelativeDateValue,
	StringValue,
	TagValue,
	Value,
} from "../../src/host/obsidian/base/values.ts";

test("moved rich values remain string values and link parsing remains unsupported", () => {
	for (const ValueClass of [HTMLValue, IconValue, ImageValue, LinkValue]) {
		const value = new ValueClass("example");
		assert.ok(value instanceof StringValue);
		assert.equal(value.toString(), "example");
	}
	assert.throws(() => LinkValue.parseFromString({}, "[[example]]", ""), /Method not implemented/);
});

test("primitive values and null compare without coercion", () => {
	assert.equal(new StringValue("hello").toString(), "hello");
	assert.equal(new BooleanValue(false).isTruthy(), false);
	assert.equal(new NumberValue(0).isTruthy(), false);
	assert.equal(Value.equals(null, NullValue.value), true);
	assert.equal(Value.equals(new NumberValue(1), new StringValue("1")), false);
	assert.equal(Value.equals(new TagValue("a"), new StringValue("a")), false);
	assert.equal(Value.equals(new NumberValue(1), new NumberValue(1)), true);
});

test("lists and objects wrap nested values and compare their contents", () => {
	const input: unknown[] = ["a", 3, null, { nested: [true] }];
	const list = new ListValue(input);
	assert.ok(input[0] instanceof StringValue);
	assert.equal(list.length(), 4);
	assert.equal(list.get(99), NullValue.value);
	assert.equal(list.includes(new NumberValue(3)), true);
	assert.equal(list.concat(new ListValue(["b"])).length(), 5);
	assert.equal(list.length(), 4);
	assert.equal(Value.equals(list, new ListValue(["a", 3, null, { nested: [true] }])), true);
	assert.equal(Value.equals(new ListValue(["a, b"]), new ListValue(["a", "b"])), false);
	const object = new ObjectValue({ present: 2 });
	assert.equal(object.get("missing"), NullValue.value);
	assert.equal(object.get("toString"), NullValue.value);
	assert.equal(object.get("present").toString(), "2");
	assert.equal(new ObjectValue().isEmpty(), true);
	assert.throws(() => new ListValue([Symbol("unsupported")]), TypeError);
});

test("date parsing and calendar durations operate on valid UTC instants", () => {
	const date = DateValue.parseFromString("2024-01-31T12:34:56Z");
	assert.ok(date);
	assert.equal(DateValue.parseFromString("2024-02-30"), null);
	assert.equal(DateValue.parseFromString("not a date"), null);
	assert.equal(date.dateOnly().toString(), "2024-01-31T00:00:00.000Z");
	const relative = date.relative();
	assert.ok(relative instanceof RelativeDateValue);
	assert.equal(Value.equals(date, relative), true);
	const month = DurationValue.parseFromString("P1M");
	assert.ok(month);
	assert.equal(month.addToDate(relative).toString(), "2024-02-29T12:34:56.000Z");
	assert.equal(DurationValue.fromMilliseconds(1000).addToDate(date, true).toString(), "2024-01-31T12:34:55.000Z");
	assert.equal(DurationValue.parseFromString("P"), null);
	assert.equal(DurationValue.parseFromString("P1DT"), null);
	assert.equal(DurationValue.parseFromString("1 day"), null);
	assert.throws(() => DurationValue.fromMilliseconds(Infinity), TypeError);
});

test("files, regular expressions and rendering use plain text", () => {
	assert.equal(new FileValue({ path: "notes/a.md" }).toString(), "notes/a.md");
	assert.equal(new RegExpValue(/a/gi).toString(), "/a/gi");
	const children: string[] = [];
	const el: HTMLElement = Object.create(null);
	Object.defineProperties(el, {
		ownerDocument: { value: { createTextNode: (text: string) => text } },
		appendChild: { value: (node: string) => children.push(node) },
	});
	new StringValue("<script>bad()</script>").renderTo(el, null);
	assert.deepEqual(children, ["<script>bad()</script>"]);
});
