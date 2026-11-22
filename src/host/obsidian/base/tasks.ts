/**
 * A collection of tasks to wait for, such as cleanup work before the app quits.
 * @public
 * @since 0.10.2
 */
export class Tasks {
	private readonly promises = new Set<Promise<unknown>>();

	/**
	 * Add a task.
	 * @param callback A function that starts the task and returns its promise. It is called immediately.
	 * @public
	 * @since 0.10.2
	 */
	add(callback: () => Promise<any>): void {
		this.addPromise(callback());
	}

	/**
	 * Add a promise to wait for.
	 * @param promise The promise.
	 * @public
	 * @since 0.10.2
	 */
	addPromise(promise: Promise<any>): void {
		this.promises.add(promise);
		void promise.then(
			() => {
				this.promises.delete(promise);
			},
			() => {
				this.promises.delete(promise);
			},
		);
	}

	/**
	 * Check if there are no tasks.
	 * @public
	 * @since 0.10.2
	 */
	isEmpty(): boolean {
		return this.promises.size === 0;
	}

	/**
	 * Get a promise that resolves when all tasks have completed.
	 * @public
	 * @since 0.10.2
	 */
	promise(): Promise<any> {
		if (this.promises.size === 0) {
			return Promise.resolve([]);
		}
		return Promise.all([...this.promises]).then(() => []);
	}
}
