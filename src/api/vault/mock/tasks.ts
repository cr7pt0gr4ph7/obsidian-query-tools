/**
 * A collection of tasks to wait for, such as cleanup work before the app quits.
 * @public
 * @since 0.10.2
 */
export class Tasks {
	/**
	 * Add a task.
	 * @param callback A function that starts the task and returns its promise. It is called immediately.
	 * @public
	 * @since 0.10.2
	 */
	add(callback: () => Promise<any>): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Add a promise to wait for.
	 * @param promise The promise.
	 * @public
	 * @since 0.10.2
	 */
	addPromise(promise: Promise<any>): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Check if there are no tasks.
	 * @public
	 * @since 0.10.2
	 */
	isEmpty(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get a promise that resolves when all tasks have completed.
	 * @public
	 * @since 0.10.2
	 */
	promise(): Promise<any> {
		throw new Error("Method not implemented.");
	}
}
