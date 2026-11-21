import assert from "node:assert/strict";
import { test } from "node:test";
import type { Extension, StateField } from "@codemirror/state";
import type { EditorView, ViewPlugin } from "@codemirror/view";
import type {
	Extension as MockExtension,
	StateField as MockStateField,
} from "../../src/host/obsidian/compat/codemirror/state.ts";
import type {
	EditorView as MockEditorView,
	ViewPlugin as MockViewPlugin,
	ViewPlugiN,
} from "../../src/host/obsidian/compat/codemirror/view.ts";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

test("mock CodeMirror types match the installed CodeMirror API", () => {
	const matches: [
		Equal<MockExtension, Extension>,
		Equal<MockStateField<number>, StateField<number>>,
		Equal<MockEditorView, EditorView>,
		Equal<MockViewPlugin<object>, ViewPlugin<object>>,
		Equal<ViewPlugiN<object>, ViewPlugin<object>>,
	] = [true, true, true, true, true];
	assert.ok(matches.every(Boolean));
});
