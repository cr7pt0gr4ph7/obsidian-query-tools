import type { EventRef } from "./events.js";

/**
 * A component that can be loaded and unloaded.
 * @public
 * @since 0.9.7
 */
export class Component {
	private loaded = false;
	private started = false;
	private readonly children = new Set<Component>();
	private readonly cleanups: Array<() => unknown> = [];

	/**
	 * Load this component and its children.
	 * @public
	 * @since 0.9.7
	 */
	load(): void {
		if (this.loaded) {
			return;
		}
		this.started = true;
		this.loaded = true;
		try {
			this.onload();
		} catch (error) {
			this.loaded = false;
			throw error;
		}
		for (const child of this.children) {
			child.load();
		}
	}

	/**
	 * Override this to load your component.
	 * @public
	 * @virtual
	 * @since 0.9.7
	 */
	onload(): void {
		// Subclasses override this method.
	}

	/**
	 * Unload this component and its children.
	 * @public
	 * @since 0.9.7
	 */
	unload(): void {
		if (!this.loaded) {
			return;
		}
		this.loaded = false;
		let firstError: unknown;
		const runCleanup = (cleanup: () => unknown) => {
			try {
				cleanup();
			} catch (error) {
				firstError ??= error;
			}
		};
		try {
			this.onunload();
		} catch (error) {
			firstError ??= error;
		}
		for (const cleanup of [...this.cleanups].reverse()) {
			runCleanup(cleanup);
		}
		this.cleanups.length = 0;
		for (const child of [...this.children].reverse()) {
			try {
				child.unload();
			} catch (error) {
				firstError ??= error;
			}
		}
		if (firstError !== undefined) {
			throw firstError;
		}
	}

	/**
	 * Override this to unload your component.
	 * @public
	 * @virtual
	 * @since 0.9.7
	 */
	onunload(): void {
		// Subclasses override this method.
	}

	/**
	 * Adds a child component, loading it if this component is loaded.
	 * @param component The component.
	 * @public
	 * @since 0.12.0
	 */
	addChild<T extends Component>(component: T): T {
		this.children.add(component);
		if (this.loaded) {
			component.load();
		}
		return component;
	}

	/**
	 * Removes a child component, unloading it.
	 * @param component The component.
	 * @public
	 * @since 0.12.0
	 */
	removeChild<T extends Component>(component: T): T {
		this.children.delete(component);
		component.unload();
		return component;
	}

	/**
	 * Registers a callback to be called when unloading.
	 * @param cb The callback.
	 * @public
	 * @since 0.9.7
	 */
	register(cb: () => any): void {
		if (this.started && !this.loaded) {
			cb();
			return;
		}
		this.cleanups.push(cb);
	}

	/**
	 * Registers an event to be detached when unloading.
	 * @param eventRef The event reference.
	 * @public
	 * @since 0.9.7
	 */
	registerEvent(eventRef: EventRef): void {
		this.register(() => {
			const listener = eventRef as EventRef & { detach?: () => void };
			listener.detach?.();
		});
	}

	/**
	 * Registers a DOM event to be detached when unloading.
	 * @param el The window.
	 * @param type The event type.
	 * @param callback The listener.
	 * @param options The `addEventListener` options.
	 * @overload
	 * @public
	 * @since 0.14.8
	 */
	registerDomEvent<K extends keyof WindowEventMap>(
		el: Window,
		type: K,
		callback: (this: HTMLElement, ev: WindowEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions,
	): void;

	/**
	 * Registers a DOM event to be detached when unloading.
	 * @param el The document.
	 * @param type The event type.
	 * @param callback The listener.
	 * @param options The `addEventListener` options.
	 * @overload
	 * @public
	 * @since 0.14.8
	 */
	registerDomEvent<K extends keyof DocumentEventMap>(
		el: Document,
		type: K,
		callback: (this: HTMLElement, ev: DocumentEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions,
	): void;

	/**
	 * Registers a DOM event to be detached when unloading.
	 * @param el The element.
	 * @param type The event type.
	 * @param callback The listener.
	 * @param options The `addEventListener` options.
	 * @overload
	 * @public
	 * @since 0.14.8
	 */
	registerDomEvent<K extends keyof HTMLElementEventMap>(
		el: HTMLElement,
		type: K,
		callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions,
	): void;

	registerDomEvent(el: any, type: string, callback: Function, options?: boolean | AddEventListenerOptions): void {
		el.addEventListener(type, callback, options);
		this.register(() => el.removeEventListener(type, callback, options));
	}

	/**
	 * Registers an interval (from setInterval) to be cancelled when unloading.
	 * Use {@link window.setInterval} instead of {@link setInterval} to avoid TypeScript confusing between NodeJS vs Browser API.
	 * @param id The interval ID.
	 * @example
	 * ```ts
	 * component.registerInterval(window.setInterval(() => {
	 *   console.log('Interval');
	 * }, 1000));
	 * ```
	 * @public
	 * @since 0.13.8
	 */
	registerInterval(id: number): number {
		this.register(() => clearInterval(id));
		return id;
	}
}
