import assert from "node:assert/strict";
import { test } from "node:test";
import {
	arrayBufferToBase64,
	arrayBufferToHex,
	base64ToArrayBuffer,
	getBlobArrayBuffer,
	hexToArrayBuffer,
} from "../../../../src/host/obsidian/base/arraybuffer.js";

test("ArrayBuffer base64 and hex conversions round-trip", () => {
	const bytes = new Uint8Array([0, 1, 127, 128, 255]);
	const buffer = bytes.buffer;

	assert.equal(arrayBufferToHex(buffer), "00017f80ff");
	assert.deepEqual([...new Uint8Array(hexToArrayBuffer("00017f80ff"))], [...bytes]);
	assert.equal(arrayBufferToBase64(buffer), "AAF/gP8=");
	assert.deepEqual([...new Uint8Array(base64ToArrayBuffer("AAF/gP8="))], [...bytes]);
	assert.throws(() => hexToArrayBuffer("abc"), TypeError);
	assert.throws(() => hexToArrayBuffer("gg"), TypeError);
});

test("Blob ArrayBuffer conversion preserves bytes", async () => {
	const blob = new Blob([new Uint8Array([10, 20, 30])], { type: "application/octet-stream" });
	assert.deepEqual([...new Uint8Array(await getBlobArrayBuffer(blob))], [10, 20, 30]);
});
