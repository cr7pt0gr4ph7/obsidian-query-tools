/**
 * A reference to an event listener, returned by {@link Events.on}.
 * @public
 */
// biome-ignore lint/complexity/noBannedTypes: Using an empty object type for EventRef is intentional to represent an opaque reference.
export type EventRef = {};

interface Listener {
	name: string;
	callback: (...data: any[]) => any;
	ctx?: unknown;
	detach: () => void;
}

/**
 * A base class for any module that emits events for components to listen to. Emitters fire events with `trigger()` and consumers listen for events with `on()`.
 * @public
 * @since 0.9.7
 */
export class Events {
	private readonly handlers = new Map<string, Set<Listener>>();

	/**
	 * Add an event listener.
	 *
	 * @param name The event name.
	 * @param callback The listener.
	 * @param ctx The `this` value for the callback.
	 * @public
	 * @since 0.9.7
	 */
	on(name: string, callback: (...data: any[]) => any, ctx?: any): EventRef {
		const listener: Listener = {
			name,
			callback,
			ctx,
			detach: () => this.offref(listener),
		};
		let set = this.handlers.get(name);
		if (!set) {
			set = new Set();
			this.handlers.set(name, set);
		}
		set.add(listener);
		return listener;
	}

	/**
	 * Remove an event listener.
	 *
	 * @param name The event name.
	 * @param callback The listener.
	 * @public
	 * @since 0.9.7
	 */
	off(name: string, callback: (...data: any[]) => any): void {
		const set = this.handlers.get(name);
		if (!set) {
			return;
		}
		for (const listener of set) {
			if (listener.callback === callback) {
				set.delete(listener);
			}
		}
		if (set.size === 0) {
			this.handlers.delete(name);
		}
	}

	/**
	 * Remove an event listener by reference.
	 *
	 * @param ref The event reference.
	 * @public
	 * @since 0.9.7
	 */
	offref(ref: EventRef): void {
		const listener = ref as Listener;
		const set = this.handlers.get(listener.name);
		if (!set) {
			return;
		}
		set.delete(listener);
		if (set.size === 0) {
			this.handlers.delete(listener.name);
		}
	}

	/**
	 * Trigger an event, executing all the listeners in order even if some of them throw an error.
	 *
	 * @param name The event name.
	 * @param data The arguments for the listeners.
	 * @public
	 * @since 0.9.7
	 */
	trigger(name: string, ...data: any[]): void {
		const set = this.handlers.get(name);
		if (!set) {
			return;
		}
		for (const listener of [...set]) {
			this.tryTrigger(listener, data);
		}
	}

	/**
	 * Call a single event listener. If the listener throws, the error is rethrown asynchronously so it doesn't interrupt the caller.
	 *
	 * @param evt The event reference.
	 * @param args The arguments for the listener.
	 * @public
	 * @since 0.9.7
	 */
	tryTrigger(evt: EventRef, args: any[]): void {
		const listener = evt as Listener;
		try {
			listener.callback.apply(listener.ctx, args);
		} catch (error) {
			setTimeout(() => {
				throw error;
			}, 0);
		}
	}
}
