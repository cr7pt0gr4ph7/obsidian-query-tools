import type { EventRef } from "./events";
import type { OverloadUnion } from "./overloads.internal";
import type { withTimeout } from "./promises.internal";

// biome-ignore lint/suspicious/noConfusingVoidType: This type resolves an empty tuple to void, a single-element tuple to the element type, and otherwise keeps the tuple as-is.
type TupleOrSingleOrVoid<TArgs extends any[]> = TArgs extends [] ? void : TArgs extends [infer T] ? T : TArgs;

/**
 * Check each union member to find one that matches the specified event key,
 * and extract its callback argument types.
 */
type FindEventArgsFromOverloads<TSearchForKey extends string, TOverloadUnion> = TOverloadUnion extends (
	event: infer TKey,
	callback: (...args: infer TArgs) => void,
	ctx?: any,
) => EventRef
	? TKey extends TSearchForKey
		? TArgs
		: never
	: never;

/** Returns `TFallback` if the `T` is `never`, otherwise returns `T` itself. */
type FallbackIfNever<T, TFallback> = T extends never ? TFallback : T;

/**
 * Find the argument types for the specified event key in the given overloaded "on" function.
 * Returns `unknown` if not found.
 */
type FindEventArgs<TSearchForKey extends string, TOverload extends (...args: any[]) => any> = FallbackIfNever<
	FindEventArgsFromOverloads<TSearchForKey, OverloadUnion<TOverload>>,
	unknown
>;

/**
 * Convert the argument types of the specified event key in the given overloaded "on" function
 * to a single type suitable for the resolved value of `awaitEvent`.
 */
type AwaitEventResult<TKey extends string, TOverload extends (...args: any[]) => any> = TupleOrSingleOrVoid<
	FindEventArgs<TKey, TOverload>
>;

export function awaitEvent<
	TKey extends string,
	TOn extends (event: string, callback: (...args: any[]) => void, ctx?: any) => EventRef,
>(
	emitter: {
		on: TOn;
		offref: (ref: EventRef) => void;
	},
	event: TKey,
	timeoutMs?: number,
): Promise<AwaitEventResult<TKey, TOn>>;

export function awaitEvent(
	emitter: {
		on: (event: string, callback: (...args: any[]) => void, ctx?: any) => EventRef;
		offref: (ref: EventRef) => void;
	},
	event: string,
	timeoutMs?: number,
): Promise<unknown>;

export function awaitEvent(
	emitter: {
		on: (event: string, callback: (...args: any[]) => void, ctx?: any) => EventRef;
		offref: (ref: EventRef) => void;
	},
	event: string,
	timeoutMs?: number,
): Promise<any> {
	if (timeoutMs && timeoutMs <= 0) {
		timeoutMs = undefined;
	}
	return new Promise((resolve, reject) => {
		let ref: EventRef | undefined;
		let timeout: ReturnType<typeof setTimeout> | undefined;
		ref = emitter.on(event, (...args) => {
			if (ref !== undefined) {
				emitter.offref(ref);
				ref = undefined;
			}
			if (timeout !== undefined) {
				clearTimeout(timeout);
				timeout = undefined;
			}
			resolve(args.length === 0 ? undefined : args.length === 1 ? args[0] : args);
		});
		if (timeoutMs !== undefined) {
			timeout = setTimeout(() => {
				if (ref !== undefined) {
					emitter.offref(ref);
					ref = undefined;
				}
				if (timeout !== undefined) {
					clearTimeout(timeout);
					timeout = undefined;
				}
				reject(new Error(`awaitEvent('${event}') timed out after ${timeoutMs} ms`));
			}, timeoutMs);
		}
	});
}
