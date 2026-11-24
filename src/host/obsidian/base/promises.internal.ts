/**
 * Creates a promise that rejects after the specified timeout.
 *
 * @param ms The number of milliseconds to wait before rejecting the promise.
 * @returns A promise that rejects after the specified timeout.
 */
export function rejectAfter<T = never>(ms: number): Promise<T> {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error(`Promise rejected after ${ms}ms`)), ms);
	});
}

/**
 * Creates a promise that rejects if the specified timeout
 * is reached before the original promise resolves.
 *
 * @param promise The original promise to wrap with a timeout.
 * @param ms The number of milliseconds to wait before triggering the timeout.
 * @param onTimeout Optional callback function to execute if the timeout is reached.
 * @returns A promise that resolves with the original promise's value or rejects if the timeout is reached.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, onTimeout?: () => void | Promise<void>): Promise<T> {
	return new Promise((_, reject) => {
		const timer = setTimeout(async () => {
			if (onTimeout) {
				const promise = onTimeout();
				if (promise) {
					await promise;
				}
			}
			reject(new Error(`Promise rejected due to timeout after ${ms}ms`));
		}, ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				return value;
			},
			(err) => {
				clearTimeout(timer);
				reject(err);
			},
		);
	});
}
