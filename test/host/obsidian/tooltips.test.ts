import assert from "node:assert/strict";
import { test } from "node:test";
import { setTooltip } from "../../../src/api/vault/mock/unsupported/tooltips.ts";

test("setTooltip adds text and placement attributes", () => {
	const attributes = new Map<string, string>();
	const element = {
		setAttribute(name: string, value: string) {
			attributes.set(name, value);
		},
	} as unknown as HTMLElement;

	setTooltip(element, "Helpful text", {
		placement: "top",
		delay: 250,
		gap: 8,
		classes: ["wide", "accent"],
	});

	assert.equal(attributes.get("title"), "Helpful text");
	assert.equal(attributes.get("aria-label"), "Helpful text");
	assert.equal(attributes.get("data-tooltip-position"), "top");
	assert.equal(attributes.get("data-tooltip-delay"), "250");
	assert.equal(attributes.get("data-tooltip-gap"), "8");
	assert.equal(attributes.get("data-tooltip-classes"), "wide accent");
});
