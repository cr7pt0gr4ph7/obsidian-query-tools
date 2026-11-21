/**
 * Converts an `ArrayBuffer` to a base64 string.
 * @param buffer The data.
 * @public
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

/**
 * Converts an `ArrayBuffer` to a hex string.
 * @param data The data.
 * @public
 */
export function arrayBufferToHex(data: ArrayBuffer): string {
	return [...new Uint8Array(data)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Converts a base64 string to an `ArrayBuffer`.
 * @param base64 The base64 string.
 * @public
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index++) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes.buffer;
}

/**
 * Converts a Blob to an ArrayBuffer.
 * @param blob The blob.
 * @public
 */
export function getBlobArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
	return blob.arrayBuffer();
}

/**
 * Converts a hex string to an ArrayBuffer.
 * @param hex The hex string.
 * @public
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
	if (hex.length % 2 !== 0 || !/^(?:[0-9a-fA-F]{2})*$/.test(hex)) {
		throw new TypeError("Hex string must contain only complete byte pairs.");
	}
	const bytes = new Uint8Array(hex.length / 2);
	for (let index = 0; index < hex.length; index += 2) {
		bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
	}
	return bytes.buffer;
}
