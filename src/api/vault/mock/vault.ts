/**
 * Work with files and folders stored inside a vault.
 * @see {@link https://docs.obsidian.md/Plugins/Vault}.
 * @public
 * @since 0.9.7
 */
export class Vault extends Events {
	/**
	 * The low-level adapter for working with the files directly.
	 * @public
	 * @since 0.9.7
	 */
	adapter: DataAdapter;

	/**
	 * Gets the path to the config folder.
	 * This value is typically `.obsidian` but it could be different.
	 * @public
	 * @since 0.11.1
	 */
	configDir: string;

	/**
	 * Gets the name of the vault.
	 * @public
	 * @since 0.9.7
	 */
	getName(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get a file inside the vault at the given path.
	 * @param path The path of the file.
	 * @returns The file, or `null` if it does not exist.
	 * @public
	 * @since 1.5.7
	 */
	getFileByPath(path: string): TFile | null {
		throw new Error("Method not implemented.");
	}
	/**
	 * Get a folder inside the vault at the given path.
	 * @param path The path of the folder.
	 * @returns The folder, or `null` if it does not exist.
	 * @public
	 * @since 1.5.7
	 */
	getFolderByPath(path: string): TFolder | null {
		throw new Error("Method not implemented.");
	}
	/**
	 * Get a file or folder inside the vault at the given path. To check if the return type is
	 * a file, use `instanceof TFile`. To check if it is a folder, use `instanceof TFolder`.
	 * @param path vault absolute path to the folder or file, with extension, case sensitive.
	 * @returns The file or folder, or `null` if it's not found.
	 * @example
	 * ```ts
	 * console.log(vault.getAbstractFileByPath('existent-file.md')); // TFile
	 * console.log(vault.getAbstractFileByPath('existent-folder')); // TFolder
	 * console.log(vault.getAbstractFileByPath('non-existent-file.md')); // null
	 * console.log(vault.getAbstractFileByPath('non-existent-folder')); // null
	 * ```
	 * @public
	 * @since 0.11.11
	 */
	getAbstractFileByPath(path: string): TAbstractFile | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the root folder of the current vault.
	 * @public
	 * @since 0.9.7
	 */
	getRoot(): TFolder {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a new plaintext file inside the vault.
	 * @param path Vault absolute path for the new file, with extension.
	 * @param data The text content.
	 * @param options Write options.
	 * @throws Error if file already exists.
	 * @public
	 * @since 0.9.7
	 */
	create(path: string, data: string, options?: DataWriteOptions): Promise<TFile> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Create a new binary file inside the vault.
	 * @param path Vault absolute path for the new file, with extension.
	 * @param data The binary content.
	 * @param options Write options.
	 * @throws Error if file already exists.
	 * @public
	 * @since 0.9.7
	 */
	createBinary(path: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<TFile> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Create a new folder inside the vault.
	 * @param path Vault absolute path for the new folder.
	 * @throws Error if folder already exists.
	 * @public
	 * @since 1.4.0
	 */
	createFolder(path: string): Promise<TFolder> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Read a plaintext file that is stored inside the vault, directly from disk.
	 * Use this if you intend to modify the file content afterwards.
	 * Use {@link Vault.cachedRead} otherwise for better performance.
	 * @param file The file.
	 * @public
	 * @since 0.9.7
	 */
	read(file: TFile): Promise<string> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Read the content of a plaintext file stored inside the vault.
	 * Use this if you only want to display the content to the user.
	 * If you want to modify the file content afterward use {@link Vault.read}.
	 * @param file The file.
	 * @public
	 * @since 0.9.7
	 */
	cachedRead(file: TFile): Promise<string> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Read the content of a binary file stored inside the vault.
	 * @param file The file.
	 * @public
	 * @since 0.9.7
	 */
	readBinary(file: TFile): Promise<ArrayBuffer> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Returns a URI for the browser engine to use, for example to embed an image.
	 * @param file The file.
	 * @public
	 * @since 0.9.7
	 */
	getResourcePath(file: TFile): string {
		throw new Error("Method not implemented.");
	}
	/**
	 * Deletes the file completely.
	 * @param file The file or folder.
	 * @param force Whether to delete a folder even if it has hidden children.
	 * @public
	 * @since 0.9.7
	 */
	delete(file: TAbstractFile, force?: boolean): Promise<void> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Tries to move to system trash. If that isn't successful/allowed, use local trash.
	 * @param file The file or folder.
	 * @param system Set to `false` to use local trash by default.
	 * @public
	 * @since 0.9.7
	 */
	trash(file: TAbstractFile, system: boolean): Promise<void> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Rename or move a file. To ensure links are automatically renamed,
	 * use {@link FileManager.renameFile} instead.
	 * @param file The file or folder.
	 * @param newPath The new vault absolute path.
	 * @public
	 * @since 0.9.11
	 */
	rename(file: TAbstractFile, newPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Modify the contents of a plaintext file.
	 * @param file The file.
	 * @param data The file content.
	 * @param options Write options.
	 * @public
	 * @since 0.9.7
	 */
	modify(file: TFile, data: string, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Modify the contents of a binary file.
	 * @param file The file.
	 * @param data The file content.
	 * @param options Write options.
	 * @public
	 * @since 0.9.7
	 */
	modifyBinary(file: TFile, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Add text to the end of a plaintext file inside the vault.
	 * @param file The file.
	 * @param data The text.
	 * @param options Write options.
	 * @public
	 * @since 0.13.0
	 */
	append(file: TFile, data: string, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Add data to the end of a binary file inside the vault.
	 * @param file - The file
	 * @param data - the data to add
	 * @param options - (Optional)
	 * @public
	 * @since 1.12.3
	 */
	appendBinary(file: TFile, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Atomically read, modify, and save the contents of a note.
	 * @param file The file.
	 * @param fn A callback function which returns the new content of the note synchronously.
	 * @param options Write options.
	 * @returns The new content of the note.
	 * @example
	 * ```ts
	 * await vault.process(file, (data) => {
	 *     return data.replace('foo', 'bar');
	 * });
	 * ```
	 * @public
	 * @since 1.1.0
	 */
	process(file: TFile, fn: (data: string) => string, options?: DataWriteOptions): Promise<string> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Create a copy of a file or folder.
	 * @param file The file or folder.
	 * @param newPath Vault absolute path of the copy.
	 * @public
	 * @since 1.8.7
	 */
	copy<T extends TAbstractFile>(file: T, newPath: string): Promise<T> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Get all files and folders in the vault.
	 * @public
	 * @since 0.9.7
	 */
	getAllLoadedFiles(): TAbstractFile[] {
		throw new Error("Method not implemented.");
	}
	/**
	 * Get all folders in the vault.
	 * @param includeRoot Whether to include the root folder (`/`).
	 * @public
	 * @since 1.6.6
	 */
	getAllFolders(includeRoot?: boolean): TFolder[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Recursively iterate over a folder and all files and folders inside it.
	 * @param root The folder to start from.
	 * @param cb Called for each file and folder, including `root`.
	 * @public
	 * @since 0.9.7
	 */
	static recurseChildren(root: TFolder, cb: (file: TAbstractFile) => any): void {
		throw new Error("Method not implemented.");
	}
	/**
	 * Get all Markdown files in the vault.
	 * @public
	 * @since 0.9.7
	 */
	getMarkdownFiles(): TFile[] {
		throw new Error("Method not implemented.");
	}
	/**
	 * Get all files in the vault.
	 * @public
	 * @since 0.9.7
	 */
	getFiles(): TFile[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when a file is created.
	 * This is also called when the vault is first loaded for each existing file
	 * If you do not wish to receive create events on vault load, register your event handler inside {@link Workspace.onLayoutReady}.
	 * @public
	 * @since 0.9.7
	 */
	on(name: "create", callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
	/**
	 * Called when a file is modified.
	 * @public
	 * @since 0.9.7
	 */
	on(name: "modify", callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
	/**
	 * Called when a file is deleted.
	 * @public
	 * @since 0.9.7
	 */
	on(name: "delete", callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
	/**
	 * Called when a file is renamed.
	 * @public
	 * @since 0.9.7
	 */
	on(name: "rename", callback: (file: TAbstractFile, oldPath: string) => any, ctx?: any): EventRef {
		throw new Error("Method not implemented.");
	}
}
