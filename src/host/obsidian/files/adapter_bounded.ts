import { constants, type Stats } from "node:fs";
import { lstat, open, opendir, realpath, type FileHandle } from "node:fs/promises";
import path from "node:path";
import { Errors } from "../../../api/utils/errors.js";
import { validatePath } from "../../../api/utils/paths.js";
import type { DataAdapter, DataWriteOptions, ListedFiles, Stat } from "./adapter.js";

/** Limits applied while capturing a read-only vault snapshot. */
export interface BoundedAdapterLimits {
	/** Maximum number of directory entries. */
	maxEntries: number;
	/** Maximum number of Markdown files. */
	maxFiles: number;
	/** Maximum bytes in an individual Markdown file. */
	maxFileBytes: number;
}

interface Entry {
	stat: Stat;
	children?: ListedFiles;
	content?: Uint8Array;
}

const fdPath = (file: FileHandle) => `/proc/self/fd/${file.fd}`;
const signature = (stat: Stats) => `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
const metadata = (stat: Stats, type: Stat["type"]): Stat => ({
	type,
	ctime: stat.birthtimeMs,
	mtime: stat.mtimeMs,
	size: stat.size,
});

/**
 * Read-only adapter backed by a bounded, descriptor-confined vault snapshot.
 */
export class BoundedDataAdapter implements DataAdapter {
	private constructor(
		private readonly name: string,
		private readonly entries: Map<string, Entry>,
	) {}

	/**
	 * Capture a vault snapshot without following symlinks.
	 *
	 * @param root Vault root directory.
	 * @param limits Filesystem indexing limits.
	 * @returns A read-only adapter for the captured snapshot.
	 */
	static async create(root: string, limits: BoundedAdapterLimits): Promise<BoundedDataAdapter> {
		if (process.platform !== "linux" || constants.O_NOFOLLOW === undefined || constants.O_DIRECTORY === undefined) {
			throw Errors.General.UnsupportedPlatform("Linux with /proc/self/fd and O_NOFOLLOW is required.");
		}
		const entries = new Map<string, Entry>();
		let entryCount = 0;
		let fileCount = 0;
		const visit = async (directory: FileHandle, relative: string): Promise<void> => {
			const before = await directory.stat();
			const children: ListedFiles = { files: [], folders: [] };
			entries.set(relative, { stat: metadata(before, "folder"), children });
			const dir = await opendir(fdPath(directory));
			for await (const item of dir) {
				if (++entryCount > limits.maxEntries) throw Errors.Limits.Exceeded("Directory entry limit exceeded.");
				const name = relative ? `${relative}/${item.name}` : item.name;
				validatePath(name);
				const anchored = path.join(fdPath(directory), item.name);
				const original = await lstat(anchored);
				if (original.isSymbolicLink() || (!original.isDirectory() && !original.isFile())) {
					throw Errors.Files.UnsafePath("Symlinks and special files are not allowed.", name);
				}
				if (original.isDirectory()) {
					children.folders.push(name);
					const child = await open(anchored, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
					try {
						if (signature(original) !== signature(await child.stat())) {
							throw Errors.Vault.VaultChangedWhileIndexing("Directory changed while indexing.", name);
						}
						await visit(child, name);
						const current = await lstat(anchored);
						if (!current.isDirectory() || signature(current) !== signature(await child.stat())) {
							throw Errors.Vault.VaultChangedWhileIndexing("Directory changed while indexing.", name);
						}
					} finally {
						await child.close();
					}
				} else {
					children.files.push(name);
					if (!name.toLowerCase().endsWith(".md")) {
						entries.set(name, { stat: metadata(original, "file") });
						continue;
					}
					if (++fileCount > limits.maxFiles) throw Errors.Limits.Exceeded("Markdown file limit exceeded.");
					if (original.size > limits.maxFileBytes) {
						throw Errors.Files.SizeExceeded("Markdown file exceeds the byte limit.", name);
					}
					const file = await open(anchored, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
					try {
						const opened = await file.stat();
						if (!opened.isFile() || signature(original) !== signature(opened)) {
							throw Errors.Vault.VaultChangedWhileIndexing("File changed while indexing.", name);
						}
						const buffer = Buffer.alloc(opened.size + 1);
						let length = 0;
						while (length < buffer.length) {
							const { bytesRead } = await file.read(buffer, length, buffer.length - length, length);
							if (!bytesRead) break;
							length += bytesRead;
						}
						if (length > limits.maxFileBytes)
							throw Errors.Files.SizeExceeded("Markdown file exceeds the byte limit.", name);
						const after = await file.stat();
						const current = await lstat(anchored);
						if (
							!current.isFile() ||
							signature(opened) !== signature(after) ||
							signature(after) !== signature(current)
						) {
							throw Errors.Vault.VaultChangedWhileIndexing("File changed while indexing.", name);
						}
						const content = buffer.subarray(0, length);
						try {
							new TextDecoder("utf-8", { fatal: true }).decode(content);
						} catch {
							throw Errors.Files.InvalidEncoding("Markdown file is not valid UTF-8.", name);
						}
						entries.set(name, { stat: metadata(after, "file"), content });
					} finally {
						await file.close();
					}
				}
			}
			children.files.sort();
			children.folders.sort();
			if (signature(before) !== signature(await directory.stat())) {
				throw Errors.Vault.VaultChangedWhileIndexing("Directory changed while indexing.", relative);
			}
		};
		let canonical: string;
		try {
			canonical = await realpath(root);
			const original = await lstat(canonical);
			const directory = await open(canonical, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
			try {
				if (signature(original) !== signature(await directory.stat())) {
					throw Errors.Vault.VaultChangedWhileIndexing("Vault root changed while indexing.");
				}
				await visit(directory, "");
				if (signature(await lstat(canonical)) !== signature(await directory.stat())) {
					throw Errors.Vault.VaultChangedWhileIndexing("Vault root changed while indexing.");
				}
			} finally {
				await directory.close();
			}
		} catch (error) {
			if (Errors.is(error)) throw error;
			throw Errors.Vault.ReadError("Could not read the vault; it may be unreadable or changing.");
		}
		return new BoundedDataAdapter(path.basename(canonical), entries);
	}

	/**
	 * Return the vault name.
	 *
	 * @returns The name of the vault root.
	 */
	getName(): string {
		return this.name;
	}

	/**
	 * Check whether a vault-relative path exists.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @param sensitive Whether path matching must be case-sensitive.
	 * @returns Whether the path exists.
	 */
	async exists(normalizedPath: string, sensitive = false): Promise<boolean> {
		const key = validatePath(normalizedPath, true);
		return (
			this.entries.has(key) ||
			(!sensitive && [...this.entries.keys()].some((p) => p.toLowerCase() === key.toLowerCase()))
		);
	}

	/**
	 * Retrieve snapshot metadata.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @returns File or folder metadata, or null when absent.
	 */
	async stat(normalizedPath: string): Promise<Stat | null> {
		const entry = this.entries.get(validatePath(normalizedPath, true));
		return entry ? { ...entry.stat } : null;
	}

	/**
	 * List a snapshot directory.
	 *
	 * @param normalizedPath Vault-relative directory.
	 * @returns Direct vault-relative child paths.
	 */
	async list(normalizedPath: string): Promise<ListedFiles> {
		const entry = this.entries.get(validatePath(normalizedPath, true));
		if (!entry?.children) throw Errors.Vault.ReadError("Directory is not in the snapshot.", normalizedPath);
		return { files: [...entry.children.files], folders: [...entry.children.folders] };
	}

	/**
	 * Read a captured Markdown file.
	 *
	 * @param normalizedPath Vault-relative Markdown path.
	 * @returns UTF-8 file contents.
	 */
	async read(normalizedPath: string): Promise<string> {
		return new TextDecoder("utf-8", { fatal: true }).decode(await this.readBinary(normalizedPath));
	}

	/**
	 * Read the bytes of a captured Markdown file.
	 *
	 * @param normalizedPath Vault-relative Markdown path.
	 * @returns A copy of the captured bytes.
	 */
	async readBinary(normalizedPath: string): Promise<ArrayBuffer> {
		const entry = this.entries.get(validatePath(normalizedPath));
		if (!entry?.content) throw Errors.Vault.ReadError("File is not available in the snapshot.", normalizedPath);
		return Uint8Array.from(entry.content).buffer;
	}

	/**
	 * Reject resource URLs from the read-only adapter.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @returns Never returns.
	 */
	getResourcePath(normalizedPath: string): string {
		return this.deny();
	}

	/**
	 * Reject writes to the vault.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @param data Text to write.
	 * @param options Write options.
	 * @returns A rejected promise.
	 */
	async write(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void> {
		this.deny();
	}
	/**
	 * Reject binary writes to the vault.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @param data Bytes to write.
	 * @param options Write options.
	 * @returns A rejected promise.
	 */
	async writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		this.deny();
	}
	/**
	 * Reject appending to the vault.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @param data Text to append.
	 * @param options Write options.
	 * @returns A rejected promise.
	 */
	async append(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void> {
		this.deny();
	}
	/**
	 * Reject binary appends to the vault.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @param data Bytes to append.
	 * @param options Write options.
	 * @returns A rejected promise.
	 */
	async appendBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		this.deny();
	}
	/**
	 * Reject processing that mutates the vault.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @param fn Content transformation.
	 * @param options Write options.
	 * @returns Never returns.
	 */
	async process(normalizedPath: string, fn: (data: string) => string, options?: DataWriteOptions): Promise<string> {
		return this.deny();
	}
	/**
	 * Reject creating vault directories.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @returns A rejected promise.
	 */
	async mkdir(normalizedPath: string): Promise<void> {
		this.deny();
	}
	/**
	 * Reject moving entries to system trash.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @returns Never returns.
	 */
	async trashSystem(normalizedPath: string): Promise<boolean> {
		return this.deny();
	}
	/**
	 * Reject moving entries to local trash.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @returns A rejected promise.
	 */
	async trashLocal(normalizedPath: string): Promise<void> {
		this.deny();
	}
	/**
	 * Reject removing vault directories.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @param recursive Whether to remove descendants.
	 * @returns A rejected promise.
	 */
	async rmdir(normalizedPath: string, recursive: boolean): Promise<void> {
		this.deny();
	}
	/**
	 * Reject removing vault files.
	 *
	 * @param normalizedPath Vault-relative path.
	 * @returns A rejected promise.
	 */
	async remove(normalizedPath: string): Promise<void> {
		this.deny();
	}
	/**
	 * Reject renaming vault entries.
	 *
	 * @param normalizedPath Existing path.
	 * @param normalizedNewPath Destination path.
	 * @returns A rejected promise.
	 */
	async rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
		this.deny();
	}
	/**
	 * Reject copying vault entries.
	 *
	 * @param normalizedPath Existing path.
	 * @param normalizedNewPath Destination path.
	 * @returns A rejected promise.
	 */
	async copy(normalizedPath: string, normalizedNewPath: string): Promise<void> {
		this.deny();
	}

	private deny(): never {
		throw Errors.General.UnsupportedFeature("The vault adapter is read-only.");
	}
}
