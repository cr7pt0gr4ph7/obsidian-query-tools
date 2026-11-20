import type { EventRef } from "../events.js";

/**
 * A component that can be loaded and unloaded.
 * @public
 * @since 0.9.7
 */
export class Component {
	/**
	 * Load this component and its children.
	 * @public
	 * @since 0.9.7
	 */
	load(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Override this to load your component.
	 * @public
	 * @virtual
	 * @since 0.9.7
	 */
	onload(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Unload this component and its children.
	 * @public
	 * @since 0.9.7
	 */
	unload(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Override this to unload your component.
	 * @public
	 * @virtual
	 * @since 0.9.7
	 */
	onunload(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Adds a child component, loading it if this component is loaded.
	 * @param component The component.
	 * @public
	 * @since 0.12.0
	 */
	addChild<T extends Component>(component: T): T {
		throw new Error("Method not implemented.");
	}

	/**
	 * Removes a child component, unloading it.
	 * @param component The component.
	 * @public
	 * @since 0.12.0
	 */
	removeChild<T extends Component>(component: T): T {
		throw new Error("Method not implemented.");
	}

	/**
	 * Registers a callback to be called when unloading.
	 * @param cb The callback.
	 * @public
	 * @since 0.9.7
	 */
	register(cb: () => any): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Registers an event to be detached when unloading.
	 * @param eventRef The event reference.
	 * @public
	 * @since 0.9.7
	 */
	registerEvent(eventRef: EventRef): void {
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
	}
}
