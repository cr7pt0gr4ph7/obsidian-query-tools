import assert from "node:assert/strict";
import { test } from "node:test";
import { compareVersions } from "../../../../src/host/obsidian/base/api_version.internal.js";
import { apiVersion, requireApiVersion } from "../../../../src/host/obsidian/base/api_version.js";

test("API version defaults to 1.0.0", () => {
	assert.equal(apiVersion, "1.0.0");
	assert.equal(requireApiVersion("1.0.0"), true);
	assert.equal(requireApiVersion("0.16.0"), true);
	assert.equal(requireApiVersion("1.0.1"), false);
	assert.equal(requireApiVersion("2.0.0"), false);
});

test("version comparison handles component padding", () => {
	assert.equal(compareVersions("1.0.0", "1"), 0);
	assert.equal(compareVersions("1.2", "1.1.9"), 1);
	assert.equal(compareVersions("1.9", "1.10"), -1);
	assert.equal(compareVersions("1.0.1", "1.0.0"), 1);
	assert.throws(() => compareVersions("next", "1.0.0"), TypeError);
});
