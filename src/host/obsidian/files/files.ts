import path from "node:path";
import { parseDocument, stringify } from "yaml";
import type { DataAdapter, DataWriteOptions } from "./adapter.js";

/**
 * This can be either a {@link TFile} or a {@link TFolder}.
 * @public
 * @since 0.9.7
 */
export class TAbstractFile {
	/**
	 * The vault.
	 * @public
	 * @since 0.9.7
	 */
	vault: object;

	/**
	 * The path of the file.
	 * @public
	 * @since 0.9.7
	 */
	path: string;

	/**
	 * The name of the file.
	 * @public
	 * @since 0.9.7
	 */
	name: string;

	/**
	 * The parent folder of the file.
	 * @public
	 * @since 0.9.7
	 */
	parent: TFolder | null;

	/**
	 * Create a vault file-system object.
	 *
	 * @param vault Owning vault.
	 * @param filePath Vault-relative POSIX path.
	 * @param parent Parent folder, or null for the root or an external file.
	 * @param externalPath Whether the path identifies an external file.
	 */
	constructor(vault: object, filePath: string, parent: TFolder | null, externalPath = false) {
		this.vault = vault;
		this.path = normalizeVaultPath(filePath, externalPath);
		this.name = this.path ? path.posix.basename(this.path) : "";
		this.parent = parent;
	}
}

/**
 * A folder.
 * @public
 * @since 0.9.7
 */
export class TFolder extends TAbstractFile {
	/**
	 * The files and folders directly inside this folder.
	 * @public
	 * @since 0.9.7
	 */
	children: TAbstractFile[] = [];

	/**
	 * Create a folder object.
	 *
	 * @param vault Owning vault.
	 * @param folderPath Vault-relative POSIX path.
	 * @param parent Parent folder, or null for the root.
	 */
	constructor(vault: object, folderPath: string, parent: TFolder | null) {
		super(vault, folderPath, parent);
	}

	/**
	 * Check if the folder is the root folder.
	 * @public
	 * @since 0.9.7
	 */
	isRoot(): boolean {
		return this.parent === null;
	}
}

/**
 * Metadata about the file on disk.
 * @public
 */
export interface FileStats {
	/**
	 * Time of creation, represented as a unix timestamp, in milliseconds.
	 * @public
	 */
	ctime: number;

	/**
	 * Time of last modification, represented as a unix timestamp, in milliseconds.
	 * @public
	 */
	mtime: number;

	/**
	 * Size on disk, as bytes.
	 * @public
	 */
	size: number;
}

/**
 * A file.
 * @public
 * @since 0.9.7
 */
export class TFile extends TAbstractFile {
	/**
	 * The file stats.
	 * @public
	 * @since 0.9.7
	 */
	stat: FileStats;

	/**
	 * The name of the file without the extension.
	 * @public
	 * @since 0.9.7
	 */
	basename: string;

	/**
	 * The extension, without the leading dot.
	 * @public
	 * @since 0.9.7
	 */
	extension: string;

	/**
	 * Create a file object.
	 *
	 * @param vault Owning vault.
	 * @param filePath Vault-relative POSIX path.
	 * @param parent Parent folder, or null for an external file.
	 * @param stat File metadata.
	 * @param externalPath Whether the path identifies an external file.
	 */
	constructor(
		vault: object,
		filePath: string,
		parent: TFolder | null,
		stat: FileStats = emptyFileStats(),
		externalPath = false,
	) {
		super(vault, filePath, parent, externalPath);
		const parsed = path.posix.parse(this.path);
		this.basename = parsed.name;
		this.extension = parsed.ext.startsWith(".") ? parsed.ext.slice(1) : parsed.ext;
		this.stat = stat;
	}
}

/**
 * Represents a file that is outside the Vault.
 * Can be used with the vault API just like any other file.
 * Do not create these manually.
 *
 * @public
 * @since 1.14.4
 */
export class TExternalFile extends TFile {
	/**
	 * Returns the physical path in the filesystem
	 * @public
	 * @since 1.14.4
	 */
	private readonly realPath: string;

	/**
	 * Create an external file object.
	 *
	 * @param vault Owning vault.
	 * @param filePath File path.
	 * @param stat File metadata.
	 * @param realPath Physical filesystem path.
	 */
	constructor(vault: object, filePath: string, stat: FileStats, realPath: string) {
		super(vault, filePath, null, stat, true);
		this.realPath = realPath;
	}

	/**
	 * Return the physical filesystem path.
	 *
	 * @returns The physical filesystem path.
	 */
	getRealPath(): string {
		return this.realPath;
	}
}

/**
 * Manage the creation, deletion and renaming of files from the UI.
 * @public
 * @since 0.9.7
 */
export class FileManager {
	/** Low-level adapter used for file operations. */
	readonly adapter: DataAdapter;

	/** The vault's indexed root folder. */
	readonly root: TFolder;

	private vault: object;
	private readonly files = new Map<string, TAbstractFile>();

	/**
	 * Create a file manager for an adapter and owning vault.
	 *
	 * @param adapter Filesystem adapter.
	 * @param vault Owning vault.
	 */
	constructor(adapter: DataAdapter, vault: object) {
		this.adapter = adapter;
		this.vault = vault;
		this.root = new TFolder(vault, "", null);
		this.files.set("", this.root);
	}

	/**
	 * Rebuild the in-memory file tree from the adapter.
	 *
	 * @returns A promise that resolves when the tree is rebuilt.
	 */
	async initialize(): Promise<void> {
		this.root.children = [];
		this.files.clear();
		this.files.set("", this.root);
		await this.loadFolder(this.root);
	}

	/**
	 * Look up a file or folder in the initialized tree.
	 *
	 * @param filePath Vault-relative path.
	 * @returns The cached file-system object, or null.
	 */
	getAbstractFileByPath(filePath: string): TAbstractFile | null {
		return this.files.get(normalizeVaultPath(filePath)) ?? null;
	}

	/**
	 * Look up a file by vault-relative path.
	 *
	 * @param filePath Vault-relative path.
	 * @returns The file, or null when the path is not a file.
	 */
	getFileByPath(filePath: string): TFile | null {
		const file = this.getAbstractFileByPath(filePath);
		return file instanceof TFile ? file : null;
	}

	/**
	 * Look up a folder by vault-relative path.
	 *
	 * @param folderPath Vault-relative path.
	 * @returns The folder, or null when the path is not a folder.
	 */
	getFolderByPath(folderPath: string): TFolder | null {
		const folder = this.getAbstractFileByPath(folderPath);
		return folder instanceof TFolder ? folder : null;
	}

	/**
	 * Return all indexed files and folders, including the root.
	 *
	 * @returns Indexed files and folders in deterministic path order.
	 */
	getAllLoadedFiles(): TAbstractFile[] {
		return [...this.files.values()].sort((a, b) => a.path.localeCompare(b.path));
	}

	/**
	 * Return indexed folders.
	 *
	 * @param includeRoot Whether to include the root folder.
	 * @returns Folders in deterministic path order.
	 */
	getAllFolders(includeRoot = false): TFolder[] {
		return [...this.files.values()]
			.filter((file): file is TFolder => file instanceof TFolder && (includeRoot || !file.isRoot()))
			.sort((a, b) => a.path.localeCompare(b.path));
	}

	/**
	 * Create a plaintext file.
	 *
	 * @param filePath Vault-relative destination.
	 * @param data File contents.
	 * @param options Optional timestamps.
	 * @returns The created file object.
	 */
	async create(filePath: string, data: string, options?: DataWriteOptions): Promise<TFile> {
		const normalized = normalizeVaultPath(filePath);
		if (!normalized || this.files.has(normalized) || (await this.adapter.exists(normalized))) {
			throw new Error(`Path already exists: ${normalized}`);
		}
		const parent = this.requireParentFolder(normalized);
		await this.adapter.write(normalized, data, options);
		return this.addFile(normalized, parent, await this.requireFileStat(normalized));
	}

	/**
	 * Create a binary file.
	 *
	 * @param filePath Vault-relative destination.
	 * @param data Binary content.
	 * @param options Optional timestamps.
	 * @returns The created file object.
	 */
	async createBinary(filePath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<TFile> {
		const normalized = normalizeVaultPath(filePath);
		if (!normalized || this.files.has(normalized) || (await this.adapter.exists(normalized))) {
			throw new Error(`Path already exists: ${normalized}`);
		}
		const parent = this.requireParentFolder(normalized);
		await this.adapter.writeBinary(normalized, data, options);
		return this.addFile(normalized, parent, await this.requireFileStat(normalized));
	}

	/**
	 * Create a folder and add it to the indexed tree.
	 *
	 * @param folderPath Vault-relative destination.
	 * @returns The created folder object.
	 */
	async createFolder(folderPath: string): Promise<TFolder> {
		const normalized = normalizeVaultPath(folderPath);
		if (!normalized || this.files.has(normalized) || (await this.adapter.exists(normalized))) {
			throw new Error(`Path already exists: ${normalized}`);
		}
		const parent = this.requireParentFolder(normalized);
		await this.adapter.mkdir(normalized);
		const folder = new TFolder(this.vault, normalized, parent);
		parent.children.push(folder);
		this.files.set(normalized, folder);
		return folder;
	}

	/**
	 * Remove a file or folder.
	 *
	 * @param file Object to remove.
	 * @param force Whether to recursively remove a nonempty folder.
	 */
	async delete(file: TAbstractFile, force = false): Promise<void> {
		this.assertManaged(file);
		if (file instanceof TFolder) {
			if (file.children.length && !force) {
				throw new Error(`Folder is not empty: ${file.path}`);
			}
			await this.adapter.rmdir(file.path, force);
			this.removeFromIndex(file);
		} else {
			await this.adapter.remove(file.path);
			this.removeFromIndex(file);
		}
	}

	/**
	 * Trash a file or folder, falling back to the vault-local trash.
	 *
	 * @param file Object to trash.
	 */
	async trash(file: TAbstractFile, system = true): Promise<void> {
		this.assertManaged(file);
		if (!system || !(await this.adapter.trashSystem(file.path))) {
			await this.adapter.trashLocal(file.path);
		}
		this.removeFromIndex(file);
	}

	/**
	 * Rename a file or folder and update its indexed descendants.
	 *
	 * @param file Object to rename.
	 * @param newPath Destination path.
	 */
	async rename(file: TAbstractFile, newPath: string): Promise<void> {
		this.assertManaged(file);
		const normalized = normalizeVaultPath(newPath);
		if (!normalized || this.files.has(normalized) || (await this.adapter.exists(normalized))) {
			throw new Error(`Path already exists or is invalid: ${normalized}`);
		}
		if (file instanceof TFolder && normalized.startsWith(`${file.path}/`)) {
			throw new Error("A folder cannot be moved into one of its descendants.");
		}
		const parent = this.requireParentFolder(normalized);
		const oldPath = file.path;
		await this.adapter.rename(oldPath, normalized);
		file.parent?.children.splice(file.parent.children.indexOf(file), 1);
		parent.children.push(file);
		file.parent = parent;
		this.rekey(file, oldPath, normalized);
	}

	/**
	 * Copy a file or folder and add the copy to the index.
	 *
	 * @param file Source file.
	 * @param newPath Destination path.
	 * @returns The newly indexed copy.
	 */
	copy(file: TFile, newPath: string): Promise<TFile>;
	copy(file: TFolder, newPath: string): Promise<TFolder>;
	copy(file: TAbstractFile, newPath: string): Promise<TAbstractFile>;
	async copy(file: TAbstractFile, newPath: string): Promise<TAbstractFile> {
		this.assertManaged(file);
		const normalized = normalizeVaultPath(newPath);
		if (!normalized || this.files.has(normalized) || (await this.adapter.exists(normalized))) {
			throw new Error(`Path already exists or is invalid: ${normalized}`);
		}
		if (file instanceof TFolder && normalized.startsWith(`${file.path}/`)) {
			throw new Error("A folder cannot be copied into one of its descendants.");
		}
		const parent = this.requireParentFolder(normalized);
		if (file instanceof TFile) {
			if (file instanceof TExternalFile) {
				throw new Error("External files cannot be copied into the vault.");
			}
			await this.adapter.copy(file.path, normalized);
			return this.addFile(normalized, parent, await this.requireFileStat(normalized));
		}
		if (!(file instanceof TFolder)) {
			throw new Error("Only files and folders can be copied.");
		}
		await this.adapter.mkdir(normalized);
		const folder = new TFolder(this.vault, normalized, parent);
		parent.children.push(folder);
		this.files.set(normalized, folder);
		try {
			for (const child of file.children) {
				await this.copy(child, `${normalized}/${child.name}`);
			}
		} catch (error) {
			await this.adapter.rmdir(normalized, true);
			this.removeFromIndex(folder);
			throw error;
		}
		return folder;
	}

	/**
	 * Create a file object for an absolute file outside the vault.
	 *
	 * @param filePath Absolute file path accepted by the adapter.
	 * @returns The external file object.
	 */
	async createExternalFile(filePath: string): Promise<TExternalFile> {
		if (!path.isAbsolute(filePath)) {
			throw new Error("External file paths must be absolute.");
		}
		const info = await this.adapter.stat(filePath);
		if (info?.type !== "file") {
			throw new Error(`External file does not exist: ${filePath}`);
		}
		return new TExternalFile(this.vault, filePath, toFileStats(info), filePath);
	}

	private async loadFolder(folder: TFolder): Promise<void> {
		const { files, folders } = await this.adapter.list(folder.path);
		for (const filePath of files) {
			const info = await this.requireFileStat(filePath);
			this.addFile(filePath, folder, info);
		}
		for (const folderPath of folders) {
			const child = new TFolder(this.vault, folderPath, folder);
			folder.children.push(child);
			this.files.set(child.path, child);
			await this.loadFolder(child);
		}
	}

	private addFile(filePath: string, parent: TFolder, info: FileStats): TFile {
		const file = new TFile(this.vault, filePath, parent, info);
		parent.children.push(file);
		this.files.set(file.path, file);
		return file;
	}

	private async requireFileStat(filePath: string): Promise<FileStats> {
		const info = await this.adapter.stat(filePath);
		if (info?.type !== "file") {
			throw new Error(`File does not exist: ${filePath}`);
		}
		return toFileStats(info);
	}

	private requireParentFolder(filePath: string): TFolder {
		const parentPath = path.posix.dirname(filePath);
		const parent = this.getFolderByPath(parentPath === "." ? "" : parentPath);
		if (!parent) {
			throw new Error(`Parent folder does not exist: ${parentPath}`);
		}
		return parent;
	}

	private assertManaged(file: TAbstractFile): void {
		if (file.vault !== this.vault || this.files.get(file.path) !== file || file === this.root) {
			throw new Error("File does not belong to this vault.");
		}
	}

	private removeFromIndex(file: TAbstractFile): void {
		file.parent?.children.splice(file.parent.children.indexOf(file), 1);
		if (file instanceof TFolder) {
			for (const child of [...file.children]) {
				this.removeFromIndex(child);
			}
		}
		this.files.delete(file.path);
	}

	private rekey(file: TAbstractFile, oldPath: string, newPath: string): void {
		this.files.delete(oldPath);
		file.path = newPath;
		file.name = path.posix.basename(newPath);
		if (file instanceof TFile) {
			const parsed = path.posix.parse(newPath);
			file.basename = parsed.name;
			file.extension = parsed.ext.startsWith(".") ? parsed.ext.slice(1) : parsed.ext;
		}
		this.files.set(newPath, file);
		if (file instanceof TFolder) {
			for (const child of file.children) {
				const childPath = child.path.slice(oldPath.length).replace(/^\/+/, "");
				this.rekey(child, child.path, `${newPath}/${childPath}`);
			}
		}
	}

	/**
	 * Gets the folder that new files should be saved to, given the user's preferences.
	 * @param sourcePath The path to the current open/focused file,
	 * used when the user wants new files to be created 'in the same folder'.
	 * Use an empty string if there is no active file.
	 * @param newFilePath The path to the file that will be newly created,
	 * used to infer what settings to use based on the path's extension.
	 * @public
	 * @since 1.1.13
	 */
	getNewFileParent(sourcePath: string, newFilePath?: string): TFolder {
		void newFilePath;
		const source = this.getAbstractFileByPath(sourcePath);
		if (source instanceof TFolder) {
			return source;
		}
		return source?.parent ?? this.root;
	}

	/**
	 * Rename or move a file or folder safely, and update all links to it depending on the user's preferences.
	 * @param file the file or folder.
	 * @param newPath the new path.
	 * @example
	 * ```ts
	 * const file = vault.getFileByPath('foo/bar.md');
	 * if (file) {
	 *     await fileManager.renameFile(file, 'baz/qux.md');
	 * }
	 * ```
	 * @public
	 * @since 0.11.0
	 */
	renameFile(file: TAbstractFile, newPath: string): Promise<void> {
		return this.rename(file, newPath);
	}

	/**
	 * Prompt the user to confirm they want to delete the specified file or folder
	 * @param file - the file or folder to delete
	 * @returns A promise that resolves to true if the prompt was confirmed or false if it was canceled
	 * @public
	 * @since 0.15.0
	 */
	promptForDeletion(file: TAbstractFile): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Remove a file or a folder from the vault according to the user's preferred 'trash'
	 * options (either moving the file to .trash/ or the OS trash bin).
	 * @param file the file or folder.
	 * @example
	 * ```ts
	 * const file = vault.getFileByPath('foo/bar.md');
	 * if (file) {
	 *     await fileManager.trashFile(file);
	 * }
	 * ```
	 * @public
	 * @since 1.6.6
	 */
	trashFile(file: TAbstractFile): Promise<void> {
		return this.trash(file);
	}

	/**
	 * Generate a Markdown link based on the user's preferences.
	 * @param file the file to link to.
	 * @param sourcePath where the link is stored in, used to compute relative links.
	 * @param subpath A subpath, starting with `#`, used for linking to headings or blocks.
	 * @param alias The display text if it's to be different than the file name. Pass empty string to use file name.
	 * @example
	 * ```ts
	 * const file = vault.getFileByPath('foo/bar.md');
	 * if (file) {
	 *     fileManager.generateMarkdownLink(file, 'baz/qux.md', '#heading', 'Display text') // [[bar#heading|Display text]], depending on the user's link settings
	 * }
	 * ```
	 * @public
	 * @since 0.12.0
	 */
	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string {
		if (file.vault !== this.vault || (!(file instanceof TExternalFile) && this.files.get(file.path) !== file)) {
			throw new Error("File does not belong to this vault.");
		}
		void sourcePath;
		const target = file.path.replace(/\.md$/i, "");
		const display = alias || file.basename;
		return `[[${target}${subpath ?? ""}${display && display !== file.basename ? `|${display}` : ""}]]`;
	}

	/**
	 * Atomically read, modify, and save the frontmatter of a note.
	 * The frontmatter is passed in as a JS object, and should be mutated directly to achieve the desired result.
	 *
	 * Remember to handle errors thrown by this method.
	 * @param file the file to be modified. Must be a Markdown file.
	 * @param fn a callback function which mutates the frontmatter object synchronously.
	 * @param options write options.
	 * @throws YAMLParseError if the YAML parsing fails.
	 * @throws any errors that your callback function throws.
	 * @example
	 * ```ts
	 * await fileManager.processFrontMatter(file, (frontmatter) => {
	 *     frontmatter['key1'] = value;
	 *     delete frontmatter['key2'];
	 * });
	 * ```
	 * @public
	 * @since 1.4.4
	 */
	async processFrontMatter(file: TFile, fn: (frontmatter: any) => void, options?: DataWriteOptions): Promise<void> {
		this.assertManaged(file);
		if (file.extension.toLowerCase() !== "md") {
			throw new Error("Frontmatter can only be processed for Markdown files.");
		}
		await this.adapter.process(
			file.path,
			(content) => {
				const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
				if (/^---\r?\n/.test(content) && !match) {
					throw new Error("Unterminated YAML frontmatter.");
				}
				const document = parseDocument(match?.[1] ?? "");
				if (document.errors.length) {
					throw document.errors[0];
				}
				const frontmatter = match?.[1].trim() ? document.toJSON() : {};
				if (typeof frontmatter !== "object" || frontmatter === null || Array.isArray(frontmatter)) {
					throw new Error("Frontmatter must be a YAML mapping.");
				}
				fn(frontmatter);
				const yaml = stringify(frontmatter);
				const body = match ? content.slice(match[0].length) : content;
				return `---\n${yaml}---\n${body}`;
			},
			options,
		);
		file.stat = await this.requireFileStat(file.path);
	}

	/**
	 * Resolves a unique path for the attachment file being saved.
	 * Ensures that the parent directory exists and dedupes the
	 * filename if the destination filename already exists.
	 * @param filename Name of the attachment being saved.
	 * @param sourcePath The path to the note associated with this attachment, defaults to the workspace's active file.
	 * @returns The full path, according to the user's attachment settings.
	 * @public
	 * @since 1.5.7
	 */
	async getAvailablePathForAttachment(filename: string, sourcePath?: string): Promise<string> {
		const source = sourcePath ? this.getAbstractFileByPath(sourcePath) : null;
		const parent = source instanceof TFolder ? source : (source?.parent ?? this.root);
		const normalizedName = normalizeVaultPath(filename);
		const basename = path.posix.basename(normalizedName);
		if (!basename) {
			throw new Error("Attachment filename must not be empty.");
		}
		let candidate = parent.path ? `${parent.path}/${basename}` : basename;
		if (!(await this.adapter.exists(candidate))) {
			return candidate;
		}
		const extension = path.posix.extname(basename);
		const stem = basename.slice(0, basename.length - extension.length);
		for (let index = 1; ; index++) {
			candidate = parent.path ? `${parent.path}/${stem} ${index}${extension}` : `${stem} ${index}${extension}`;
			if (!(await this.adapter.exists(candidate))) {
				return candidate;
			}
		}
	}
}

function emptyFileStats(): FileStats {
	return { ctime: 0, mtime: 0, size: 0 };
}

function toFileStats(stat: { ctime: number; mtime: number; size: number }): FileStats {
	return { ctime: stat.ctime, mtime: stat.mtime, size: stat.size };
}

function normalizeVaultPath(filePath: string, external = false): string {
	if (typeof filePath !== "string" || filePath.includes("\0")) {
		throw new TypeError("Vault path must be a string without null bytes.");
	}
	const portablePath = filePath.replaceAll("\\", "/");
	if (!external && (portablePath.startsWith("/") || /^[A-Za-z]:/.test(portablePath))) {
		throw new Error("Vault paths must be relative to the vault root.");
	}
	if (external) {
		return portablePath;
	}
	const parts = portablePath.split("/");
	if (parts.includes("..")) {
		throw new Error("Vault paths must not traverse outside the vault root.");
	}
	return parts.filter((part) => part && part !== ".").join("/");
}
