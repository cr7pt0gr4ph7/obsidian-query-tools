import { type EventRef, Events } from "../../../host/obsidian/base/events.ts";
import type { DataAdapter, DataWriteOptions } from "./files/adapter.js";
import { FileManager, type TAbstractFile, TExternalFile, TFile, TFolder } from "./files/files.ts";

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
	 * File manager for the vault's file tree and mutation operations.
	 * @public
	 */
	fileManager: FileManager;

	/**
	 * Gets the path to the config folder.
	 * This value is typically `.obsidian` but it could be different.
	 * @public
	 * @since 0.11.1
	 */
	configDir: string;

	/**
	 * Create a vault backed by a data adapter.
	 *
	 * @param adapter Low-level adapter.
	 * @param configDir Path to the vault configuration directory.
	 */
	constructor(adapter: DataAdapter, configDir = ".obsidian") {
		super();
		this.adapter = adapter;
		this.configDir = configDir;
		this.fileManager = new FileManager(adapter, this);
	}

	/**
	 * Load the adapter's current file tree into the synchronous lookup index.
	 *
	 * @returns A promise that resolves when the file tree is available.
	 */
	initialize(): Promise<void> {
		return this.fileManager.initialize();
	}

	/**
	 * Gets the name of the vault.
	 * @public
	 * @since 0.9.7
	 */
	getName(): string {
		return this.adapter.getName();
	}

	/**
	 * Get a file inside the vault at the given path.
	 * @param path The path of the file.
	 * @returns The file, or `null` if it does not exist.
	 * @public
	 * @since 1.5.7
	 */
	getFileByPath(path: string): TFile | null {
		return this.fileManager.getFileByPath(path);
	}

	/**
	 * Get a folder inside the vault at the given path.
	 * @param path The path of the folder.
	 * @returns The folder, or `null` if it does not exist.
	 * @public
	 * @since 1.5.7
	 */
	getFolderByPath(path: string): TFolder | null {
		return this.fileManager.getFolderByPath(path);
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
		return this.fileManager.getAbstractFileByPath(path);
	}

	/**
	 * Get the root folder of the current vault.
	 * @public
	 * @since 0.9.7
	 */
	getRoot(): TFolder {
		return this.fileManager.root;
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
		return this.fileManager.create(path, data, options);
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
		return this.fileManager.createBinary(path, data, options);
	}

	/**
	 * Create a new folder inside the vault.
	 * @param path Vault absolute path for the new folder.
	 * @throws Error if folder already exists.
	 * @public
	 * @since 1.4.0
	 */
	createFolder(path: string): Promise<TFolder> {
		return this.fileManager.createFolder(path);
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
		this.assertVaultFile(file);
		return this.adapter.read(file.path);
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
		return this.read(file);
	}

	/**
	 * Read the content of a binary file stored inside the vault.
	 * @param file The file.
	 * @public
	 * @since 0.9.7
	 */
	readBinary(file: TFile): Promise<ArrayBuffer> {
		this.assertVaultFile(file);
		return this.adapter.readBinary(file.path);
	}

	/**
	 * Returns a URI for the browser engine to use, for example to embed an image.
	 * @param file The file.
	 * @public
	 * @since 0.9.7
	 */
	getResourcePath(file: TFile): string {
		this.assertVaultFile(file);
		return this.adapter.getResourcePath(file.path);
	}

	/**
	 * Deletes the file completely.
	 * @param file The file or folder.
	 * @param force Whether to delete a folder even if it has hidden children.
	 * @public
	 * @since 0.9.7
	 */
	delete(file: TAbstractFile, force?: boolean): Promise<void> {
		return this.fileManager.delete(file, force);
	}

	/**
	 * Tries to move to system trash. If that isn't successful/allowed, use local trash.
	 * @param file The file or folder.
	 * @param system Set to `false` to use local trash by default.
	 * @public
	 * @since 0.9.7
	 */
	trash(file: TAbstractFile, system: boolean): Promise<void> {
		return this.fileManager.trash(file, system);
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
		return this.fileManager.rename(file, newPath);
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
		this.assertVaultFile(file);
		return this.adapter.write(file.path, data, options).then(() => this.updateFileStats(file));
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
		this.assertVaultFile(file);
		return this.adapter.writeBinary(file.path, data, options).then(() => this.updateFileStats(file));
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
		this.assertVaultFile(file);
		return this.adapter.append(file.path, data, options).then(() => this.updateFileStats(file));
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
		this.assertVaultFile(file);
		return this.adapter.appendBinary(file.path, data, options).then(() => this.updateFileStats(file));
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
		this.assertVaultFile(file);
		return this.adapter.process(file.path, fn, options).then(async (result) => {
			await this.updateFileStats(file);
			return result;
		});
	}

	/**
	 * Create a copy of a file or folder.
	 * @param file The file or folder.
	 * @param newPath Vault absolute path of the copy.
	 * @public
	 * @since 1.8.7
	 */
	copy(file: TFile, newPath: string): Promise<TFile>;
	copy(file: TFolder, newPath: string): Promise<TFolder>;
	copy(file: TAbstractFile, newPath: string): Promise<TAbstractFile>;
	copy(file: TAbstractFile, newPath: string): Promise<TAbstractFile> {
		return this.fileManager.copy(file, newPath);
	}

	/**
	 * Get all files and folders in the vault.
	 * @public
	 * @since 0.9.7
	 */
	getAllLoadedFiles(): TAbstractFile[] {
		return this.fileManager.getAllLoadedFiles().filter((file) => file !== this.fileManager.root);
	}

	/**
	 * Get all folders in the vault.
	 * @param includeRoot Whether to include the root folder (`/`).
	 * @public
	 * @since 1.6.6
	 */
	getAllFolders(includeRoot?: boolean): TFolder[] {
		return this.fileManager.getAllFolders(includeRoot);
	}

	/**
	 * Recursively iterate over a folder and all files and folders inside it.
	 * @param root The folder to start from.
	 * @param cb Called for each file and folder, including `root`.
	 * @public
	 * @since 0.9.7
	 */
	static recurseChildren(root: TFolder, cb: (file: TAbstractFile) => any): void {
		cb(root);
		for (const child of root.children) {
			if (child instanceof TFolder) {
				Vault.recurseChildren(child, cb);
			} else {
				cb(child);
			}
		}
	}

	/**
	 * Get all Markdown files in the vault.
	 * @public
	 * @since 0.9.7
	 */
	getMarkdownFiles(): TFile[] {
		return this.getFiles().filter((file) => file.extension.toLowerCase() === "md");
	}

	/**
	 * Get all files in the vault.
	 * @public
	 * @since 0.9.7
	 */
	getFiles(): TFile[] {
		return this.getAllLoadedFiles().filter((file): file is TFile => file instanceof TFile);
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
	on(name: "rename", callback: (file: TAbstractFile, oldPath: string) => any, ctx?: any): EventRef;

	/**
	 * Register a vault file event listener.
	 *
	 * @param name Event name.
	 * @param callback Event listener.
	 * @param ctx Listener context.
	 * @returns Event listener reference.
	 */
	on(name: string, callback: (...data: any[]) => any, ctx?: any): EventRef {
		return super.on(name, callback, ctx);
	}

	private assertVaultFile(file: TFile): void {
		if (
			file.vault !== this ||
			(!(file instanceof TExternalFile) && this.fileManager.getAbstractFileByPath(file.path) !== file)
		) {
			throw new Error("File does not belong to this vault.");
		}
	}

	private async updateFileStats(file: TFile): Promise<void> {
		const info = await this.adapter.stat(file.path);
		if (info?.type !== "file") {
			throw new Error(`File does not exist: ${file.path}`);
		}
		file.stat = { ctime: info.ctime, mtime: info.mtime, size: info.size };
	}
}
