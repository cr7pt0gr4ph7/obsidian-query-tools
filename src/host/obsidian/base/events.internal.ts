import type { MetadataCache } from "../cache/cache";
import type { EventRef } from "./events";
import type { OverloadParameters, OverloadUnion } from "./overloads.internal";

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
type AwaitEventResult<TKey extends string,TOverload extends (...args: any[]) => any> = TupleOrSingleOrVoid<
	FindEventArgs<TKey, TOverload>
>;

export function awaitEvent<TKey extends string, TOn extends (event: string, callback: (...args: any[]) => void, ctx?: any) => EventRef>(
	emitter: {
		on: TOn;
		offref: (ref: EventRef) => void;
	},
	event: TKey,
): Promise<AwaitEventResult<TKey, TOn>>;

export function awaitEvent(
	emitter: {
		on: (event: string, callback: (...args: any[]) => void, ctx?: any) => EventRef;
		offref: (ref: EventRef) => void;
	},
	event: string,
): Promise<unknown>;

export function awaitEvent(
	emitter: {
		on: (event: string, callback: (...args: any[]) => void, ctx?: any) => EventRef;
		offref: (ref: EventRef) => void;
	},
	event: string,
): Promise<any> {
	return new Promise((resolve) => {
		let ref: EventRef | undefined;
		ref = emitter.on(event, (...args) => {
			// biome-ignore lint/style/noNonNullAssertion: Will always be non-null at this point.
			emitter.offref(ref!);
			resolve(args.length === 0 ? undefined : args.length === 1 ? args[0] : args);
		});
	});
}
