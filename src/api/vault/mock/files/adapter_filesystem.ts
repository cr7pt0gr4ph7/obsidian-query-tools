import { DataAdapter, DataWriteOptions, Stat, ListedFiles } from "./adapter.js";

/**
 * Implementation of the vault adapter for desktop.
 * @public
 */
export class FileSystemAdapter implements DataAdapter {
	/**
	 * @inheritDoc
	 * @public
	 */
	getName(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the absolute path to the vault.
	 * @public
	 */
	getBasePath(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	mkdir(normalizedPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	trashSystem(normalizedPath: string): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	trashLocal(normalizedPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	rmdir(normalizedPath: string, recursive: boolean): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	read(normalizedPath: string): Promise<string> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	readBinary(normalizedPath: string): Promise<ArrayBuffer> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	write(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
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
	 */
	process(normalizedPath: string, fn: (data: string) => string, options?: DataWriteOptions): Promise<string> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getResourcePath(normalizedPath: string): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Returns the `file://` URL of a file.
	 * @param normalizedPath The path of the file.
	 * @example
	 * ```ts
	 * console.log(adapter.getFilePath('foo/bar.md')); // file:///C:/Users/John/Documents/ObsidianVault/foo/bar.md
	 * ```
	 * @public
	 * @since 0.14.3
	 */
	getFilePath(normalizedPath: string): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	remove(normalizedPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	copy(normalizedPath: string, normalizedNewPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	exists(normalizedPath: string, sensitive?: boolean): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 0.12.2
	 */
	stat(normalizedPath: string): Promise<Stat | null> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	list(normalizedPath: string): Promise<ListedFiles> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Gets the absolute path of a file on disk.
	 * @param normalizedPath The path of the file in the vault.
	 * @example
	 * ```ts
	 * console.log(adapter.getFullPath('foo/bar.md')); // C:\Users\John\Documents\ObsidianVault\foo\bar.md
	 * ```
	 * @public
	 */
	getFullPath(normalizedPath: string): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Read a local file.
	 * @param path The absolute path of the file.
	 * @public
	 */
	static readLocalFile(path: string): Promise<ArrayBuffer> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a new directory, including any missing parent directories.
	 * @param path The absolute path of the directory.
	 * @public
	 */
	static mkdir(path: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
