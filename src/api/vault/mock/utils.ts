/**
 * Converts an `ArrayBuffer` to a base64 string.
 * @param buffer The data.
 * @public
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string;

/**
 * Converts an `ArrayBuffer` to a hex string.
 * @param data The data.
 * @public
 */
export function arrayBufferToHex(data: ArrayBuffer): string;

/**
 * Converts a base64 string to an `ArrayBuffer`.
 * @param base64 The base64 string.
 * @public
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer;

/**
 * Converts a Blob to an ArrayBuffer.
 * @param blob The blob.
 * @public
 */
export function getBlobArrayBuffer(blob: Blob): Promise<ArrayBuffer>;

/**
 * Converts the linktext to a linkpath.
 * @param linktext A wikilink without the leading [[ and trailing ]].
 * @returns The name of the file that is being linked to.
 * @example
 * ```ts
 * console.log(getLinkpath('foo#bar')); // foo
 * ```
 * @public
 */
export function getLinkpath(linktext: string): string;

/**
 * Converts a hex string to an ArrayBuffer.
 * @param hex The hex string.
 * @public
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer;
