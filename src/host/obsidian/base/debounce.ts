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
	 * @returns This debouncer.
	 * @public
	 */
	cancel(): this;

	/**
	 * If a call is pending, clear the timer and call the function immediately.
	 * @returns The function return value, or `undefined` if no call is pending.
	 * @public
	 * @since 1.4.4
	 */
	run(): V | undefined;
}

/**
 * Create a function that delays calls until a quiet period has elapsed.
 * @param cb The function to call.
 * @param timeout The delay in milliseconds.
 * @param resetTimer Whether each call resets the delay.
 * @returns A debouncer with call, cancel, and run methods.
 * @public
 */
export function debounce<T extends unknown[], V>(
	cb: (...args: [...T]) => V,
	timeout = 0,
	resetTimer = true,
): Debouncer<T, V> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let pendingArgs: [...T] | undefined;
	let pending = false;

	const invoke = (): V | undefined => {
		if (!pending) return undefined;
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
		const args = pendingArgs as [...T];
		pendingArgs = undefined;
		pending = false;
		return cb(...args);
	};

	const debounced = ((...args: [...T]): Debouncer<T, V> => {
		pendingArgs = args;
		pending = true;
		if (timer !== undefined && !resetTimer) return debounced;
		if (timer !== undefined) clearTimeout(timer);
		timer = setTimeout(() => invoke(), Math.max(0, timeout));
		return debounced;
	}) as Debouncer<T, V>;

	debounced.cancel = (): Debouncer<T, V> => {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
		pending = false;
		pendingArgs = undefined;
		return debounced;
	};
	debounced.run = invoke;
	return debounced;
}
