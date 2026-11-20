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
 * A standard debounce function.
 * Use this to have a time-delayed function only be called once in a given timeframe.
 * @param cb The function to call.
 * @param timeout The timeout, in milliseconds.
 * @param resetTimer Whether to reset the timeout when the debounce function is called again.
 * @returns a debounced function that takes the same parameter as the original function.
 * @example
 * ```ts
 * const debounced = debounce((text: string) => {
 *     console.log(text);
 * }, 1000, true);
 * debounced('Hello world'); // this will not be printed
 * await sleep(500);
 * debounced('World, hello'); // this will be printed to the console.
 * ```
 * @public
 */
export function debounce<T extends unknown[], V>(
	cb: (...args: [...T]) => V,
	timeout?: number,
	resetTimer?: boolean,
): Debouncer<T, V>;

/**
 * A debouncer wrapper for a function.
 * @public
 */
export interface Debouncer<T extends unknown[], V> {
	/**
	 * Call the debounced function.
	 * @param args The arguments.
	 * @public
	 */
	(...args: [...T]): this;
	/**
	 * Cancel any pending debounced function call.
	 * @public
	 */
	cancel(): this;
	/**
	 * If there is any pending function call, clear the timer and call the function immediately.
	 * @returns The return value of the function, or `undefined` if there are no pending function calls.
	 * @public
	 * @since 1.4.4
	 */
	run(): V | void;
}

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
