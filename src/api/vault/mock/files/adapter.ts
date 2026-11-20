/**
 * Information about a file or folder on disk.
 * @public
 */
export interface Stat {
	/**
	 * Whether this is a file or a folder.
	 * @public
	 */
	type: "file" | "folder";
	/**
	 * Time of creation, represented as a unix timestamp.
	 * @public
	 */
	ctime: number;
	/**
	 * Time of last modification, represented as a unix timestamp.
	 * @public
	 */
	mtime: number;
	/**
	 * Size on disk in bytes.
	 * @public
	 */
	size: number;
}

/**
 * The contents of a folder.
 * @public
 */
export interface ListedFiles {
	/**
	 * The vault absolute paths of the files directly in the folder.
	 * @public
	 */
	files: string[];

	/**
	 * The vault absolute paths of the folders directly in the folder.
	 * @public
	 */
	folders: string[];
}

/**
 * Options for writing to a file.
 * @public
 */
export interface DataWriteOptions {
	/**
	 * Time of creation, represented as a unix timestamp, in milliseconds.
	 * Omit this if you want to keep the default behavior.
	 * @public
	 */
	ctime?: number;
	/**
	 * Time of last modification, represented as a unix timestamp, in milliseconds.
	 * Omit this if you want to keep the default behavior.
	 * @public
	 */
	mtime?: number;
}

/**
 * Work directly with files and folders inside a vault.
 * If possible prefer using the {@link Vault} API over this.
 * @public
 */
export interface DataAdapter {
    /**
     * Gets the name of the vault.
     * @public
     */
    getName(): string;

    /**
     * Check if something exists at the given path. For a faster way to synchronously check
     * if a note or attachment is in the vault, use {@link Vault.getAbstractFileByPath}.
     * @param normalizedPath path to file/folder, use {@link normalizePath} to normalize beforehand.
     * @param sensitive Some file systems/operating systems are case-insensitive, set to `true` to force a case-sensitivity check.
     * @example
     * ```ts
     * const path = normalizePath(`${plugin.manifest.dir}/cache.json`);
     * if (await adapter.exists(path)) {
     *     const cache = JSON.parse(await adapter.read(path));
     * }
     * ```
     * @public
     */
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
    /**
     * Retrieve metadata about the given file/folder.
     * @param normalizedPath path to file/folder, use {@link normalizePath} to normalize beforehand.
     * @returns The metadata, or `null` if nothing exists at the path.
     * @example
     * ```ts
     * const stat = await adapter.stat(path);
     * if (stat?.type === 'file') {
     *     console.log(stat.size, stat.mtime);
     * }
     * ```
     * @public
     * @since 0.12.2
     */
    stat(normalizedPath: string): Promise<Stat | null>;
    /**
     * Retrieve a list of all files and folders inside the given folder, non-recursive.
     * @param normalizedPath path to folder, use {@link normalizePath} to normalize beforehand.
     * @example
     * ```ts
     * const { files, folders } = await adapter.list(`${vault.configDir}/snippets`);
     * ```
     * @public
     */
    list(normalizedPath: string): Promise<ListedFiles>;
    /**
     * Read the contents of a file.
     * @param normalizedPath path to file, use {@link normalizePath} to normalize beforehand.
     * @public
     */
    read(normalizedPath: string): Promise<string>;
    /**
     * Read the contents of a binary file.
     * @param normalizedPath path to file, use {@link normalizePath} to normalize beforehand.
     * @public
     */
    readBinary(normalizedPath: string): Promise<ArrayBuffer>;
    /**
     * Write to a plaintext file.
     * If the file exists its content will be overwritten, otherwise the file will be created.
     * @param normalizedPath path to file, use {@link normalizePath} to normalize beforehand.
     * @param data the file content.
     * @param options write options.
     * @public
     */
    write(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void>;
    /**
     * Write to a binary file.
     * If the file exists its content will be overwritten, otherwise the file will be created.
     * @param normalizedPath path to file, use {@link normalizePath} to normalize beforehand.
     * @param data the file content.
     * @param options write options.
     * @example
     * ```ts
     * const response = await requestUrl('https://example.com/image.png');
     * await adapter.writeBinary('image.png', response.arrayBuffer);
     * ```
     * @public
     */
    writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void>;
    /**
     * Add text to the end of a plaintext file.
     * @param normalizedPath path to file, use {@link normalizePath} to normalize beforehand.
     * @param data the text.
     * @param options write options.
     * @public
     */
    append(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void>;
    /**
     * Add data to the end of a binary file.
     * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
     * @param data - the data to append.
     * @param options - (Optional)
     * @public
     * @since 1.12.3
     */
    appendBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void>;
    /**
     * Atomically read, modify, and save the contents of a plaintext file.
     * @param normalizedPath path to file/folder, use {@link normalizePath} to normalize beforehand.
     * @param fn a callback function which returns the new content of the file synchronously.
     * @param options write options.
     * @returns The new content of the file.
     * @example
     * ```ts
     * await adapter.process('foo/bar.md', (data) => {
     *     return data.replace('foo', 'bar');
     * });
     * ```
     * @public
     */
    process(normalizedPath: string, fn: (data: string) => string, options?: DataWriteOptions): Promise<string>;
    /**
     * Returns a URI for the browser engine to use, for example to embed an image.
     * @param normalizedPath path to file/folder, use {@link normalizePath} to normalize beforehand.
     * @example
     * ```ts
     * createEl('img', { attr: { src: adapter.getResourcePath('foo/bar.jpg') } });
     * ```
     * @public
     */
    getResourcePath(normalizedPath: string): string;
    /**
     * Create a directory.
     * @param normalizedPath path to use for new folder, use {@link normalizePath} to normalize beforehand.
     * @public
     */
    mkdir(normalizedPath: string): Promise<void>;
    /**
     * Try moving to system trash.
     * @param normalizedPath path to file/folder, use {@link normalizePath} to normalize beforehand.
     * @returns `true` if successful. This can fail if the system trash is disabled.
     * @example
     * ```ts
     * if (!(await adapter.trashSystem(path))) {
     *     await adapter.trashLocal(path);
     * }
     * ```
     * @public
     */
    trashSystem(normalizedPath: string): Promise<boolean>;
    /**
     * Move to local trash.
     * Files will be moved into the `.trash` folder at the root of the vault.
     * @param normalizedPath path to file/folder, use {@link normalizePath} to normalize beforehand.
     * @public
     */
    trashLocal(normalizedPath: string): Promise<void>;
    /**
     * Remove a directory.
     * @param normalizedPath path to folder, use {@link normalizePath} to normalize beforehand.
     * @param recursive If `true`, delete folders under this folder recursively, if `false` the folder needs to be empty.
     * @public
     */
    rmdir(normalizedPath: string, recursive: boolean): Promise<void>;
    /**
     * Delete a file.
     * @param normalizedPath path to file, use {@link normalizePath} to normalize beforehand.
     * @public
     */
    remove(normalizedPath: string): Promise<void>;

    /**
     * Rename a file or folder.
     * @param normalizedPath current path to file/folder, use {@link normalizePath} to normalize beforehand.
     * @param normalizedNewPath new path to file/folder, use {@link normalizePath} to normalize beforehand.
     * @public
     */
    rename(normalizedPath: string, normalizedNewPath: string): Promise<void>;
    /**
     * Create a copy of a file.
     * This will fail if there is already a file at `normalizedNewPath`.
     * @param normalizedPath path to file, use {@link normalizePath} to normalize beforehand.
     * @param normalizedNewPath path to file, use {@link normalizePath} to normalize beforehand.
     * @public
     */
    copy(normalizedPath: string, normalizedNewPath: string): Promise<void>;
}
