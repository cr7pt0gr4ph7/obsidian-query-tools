import { DataAdapter, DataWriteOptions, Stat, ListedFiles } from "./adapter.js";

/**
 * Implementation of the vault adapter for mobile devices.
 * @public
 * @since 1.7.2
 */
export class CapacitorAdapter implements DataAdapter {
	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	getName(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	mkdir(normalizedPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	trashSystem(normalizedPath: string): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	trashLocal(normalizedPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	rmdir(normalizedPath: string, recursive: boolean): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	read(normalizedPath: string): Promise<string> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	readBinary(normalizedPath: string): Promise<ArrayBuffer> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	write(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	append(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.12.3
	 */
	appendBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	process(normalizedPath: string, fn: (data: string) => string, options?: DataWriteOptions): Promise<string> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	getResourcePath(normalizedPath: string): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	remove(normalizedPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	copy(normalizedPath: string, normalizedNewPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	exists(normalizedPath: string, sensitive?: boolean): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	stat(normalizedPath: string): Promise<Stat | null> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 1.7.2
	 */
	list(normalizedPath: string): Promise<ListedFiles> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Gets the absolute path of a file on the device.
	 * @param normalizedPath The path of the file in the vault.
	 * @example
	 * ```ts
	 * console.log(adapter.getFullPath('foo/bar.md')); // /storage/emulated/0/path/to/vault/foo/bar.md
	 * ```
	 * @public
	 * @since 1.7.2
	 */
	getFullPath(normalizedPath: string): string {
		throw new Error("Method not implemented.");
	}
}
