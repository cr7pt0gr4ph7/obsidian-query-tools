/**
 * A reference to an event listener, returned by {@link Events.on}.
 * @public
 */
// biome-ignore lint/complexity/noBannedTypes: Using an empty object type for EventRef is intentional to represent an opaque reference.
export type EventRef = {};

/**
 * A base class for any module that emits events for components to listen to. Emitters fire events with `trigger()` and consumers listen for events with `on()`.
 * @public
 * @since 0.9.7
 */
export class Events {
	/**
	 * Add an event listener.
	 * @param name The event name.
	 * @param callback The listener.
	 * @param ctx The `this` value for the callback.
	 * @public
	 * @since 0.9.7
	 */
	on(name: string, callback: (...data: unknown[]) => unknown, ctx?: unknown): EventRef {
		throw new Error("Method not implemented.");
	}

	/**
	 * Remove an event listener.
	 * @param name The event name.
	 * @param callback The listener.
	 * @public
	 * @since 0.9.7
	 */
	off(name: string, callback: (...data: unknown[]) => unknown): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Remove an event listener by reference.
	 * @param ref The event reference.
	 * @public
	 * @since 0.9.7
	 */
	offref(ref: EventRef): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Trigger an event, executing all the listeners in order even if some of them throw an error.
	 * @param name The event name.
	 * @param data The arguments for the listeners.
	 * @public
	 * @since 0.9.7
	 */
	trigger(name: string, ...data: unknown[]): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Call a single event listener. If the listener throws, the error is rethrown asynchronously so it doesn't interrupt the caller.
	 * @param evt The event reference.
	 * @param args The arguments for the listener.
	 * @public
	 * @since 0.9.7
	 */
	tryTrigger(evt: EventRef, args: unknown[]): void {
		throw new Error("Method not implemented.");
	}
}
