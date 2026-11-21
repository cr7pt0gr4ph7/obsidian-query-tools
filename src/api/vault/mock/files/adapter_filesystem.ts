import { constants } from "node:fs";
import { realpathSync } from "node:fs";
import {
	access,
	appendFile,
	copyFile,
	lstat,
	mkdir,
	readFile,
	readdir,
	rename,
	rm,
	stat as statFile,
	utimes,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import type { DataAdapter, DataWriteOptions, ListedFiles, Stat } from "./adapter.js";

/**
 * Filesystem implementation of the vault adapter.
 * Paths are confined to the configured root unless absolute paths are explicitly enabled.
 */
export class FileSystemAdapter implements DataAdapter {
	private readonly rootPath: string;
	private readonly allowAbsolutePaths: boolean;

	/**
	 * Create an adapter for a filesystem directory.
	 *
	 * @param basePath Root directory for vault-relative paths.
	 * @param allowAbsolutePaths Whether adapter operations may target absolute paths outside the root.
	 */
	constructor(basePath: string, allowAbsolutePaths = false) {
		this.rootPath = realpathSync(path.resolve(basePath));
		this.allowAbsolutePaths = allowAbsolutePaths;
	}

	/** @returns The vault directory name. */
	getName(): string {
		return path.basename(this.rootPath);
	}

	/** @returns The absolute vault root path. */
	getBasePath(): string {
		return this.rootPath;
	}

	/** @param normalizedPath Vault-relative directory path. */
	async mkdir(normalizedPath: string): Promise<void> {
		const target = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(target);
		await mkdir(target, { recursive: true });
	}

	/** System trash is unavailable in this standalone implementation. */
	async trashSystem(normalizedPath: string): Promise<boolean> {
		this.getFullPath(normalizedPath);
		return false;
	}

	/**
	 * Move an entry into the root-level `.trash` folder, disambiguating duplicate names.
	 *
	 * @param normalizedPath Vault-relative path to move.
	 */
	async trashLocal(normalizedPath: string): Promise<void> {
		const source = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(source);
		const trash = this.getFullPath(".trash");
		await mkdir(trash, { recursive: true });
		const name = path.basename(source);
		let destination = path.join(trash, name);
		let suffix = 1;
		while (await this.pathExists(destination)) {
			destination = path.join(trash, `${name}.${suffix++}`);
		}
		await rename(source, destination);
	}

	/**
	 * Remove a directory.
	 *
	 * @param normalizedPath Vault-relative directory path.
	 * @param recursive Whether to remove descendants.
	 */
	async rmdir(normalizedPath: string, recursive: boolean): Promise<void> {
		const target = this.getFullPath(normalizedPath);
		if (target === this.rootPath) throw new Error("Cannot remove the vault root.");
		await this.assertNoSymlink(target);
		await rm(target, { recursive, force: false });
	}

	/** @param normalizedPath Vault-relative file path. */
	async read(normalizedPath: string): Promise<string> {
		const target = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(target);
		return readFile(target, "utf8");
	}

	/** @param normalizedPath Vault-relative file path. */
	async readBinary(normalizedPath: string): Promise<ArrayBuffer> {
		const target = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(target);
		const buffer = await readFile(target);
		return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
	}

	/**
	 * Write a plaintext file.
	 *
	 * @param normalizedPath Vault-relative file path.
	 * @param data Text to write.
	 * @param options Optional timestamps.
	 */
	async write(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void> {
		const target = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(target);
		await writeFile(target, data, { encoding: "utf8" });
		await this.applyWriteOptions(target, options);
	}

	/**
	 * Write a binary file.
	 *
	 * @param normalizedPath Vault-relative file path.
	 * @param data Binary content.
	 * @param options Optional timestamps.
	 */
	async writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		const target = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(target);
		await writeFile(target, new Uint8Array(data));
		await this.applyWriteOptions(target, options);
	}

	/**
	 * Append text to a file.
	 *
	 * @param normalizedPath Vault-relative file path.
	 * @param data Text to append.
	 * @param options Optional timestamps.
	 */
	async append(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void> {
		const target = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(target);
		await appendFile(target, data, "utf8");
		await this.applyWriteOptions(target, options);
	}

	/**
	 * Append binary data to a file.
	 *
	 * @param normalizedPath Vault-relative file path.
	 * @param data Binary content to append.
	 * @param options Optional timestamps.
	 */
	async appendBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void> {
		const target = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(target);
		await appendFile(target, new Uint8Array(data));
		await this.applyWriteOptions(target, options);
	}

	/**
	 * Read, transform, then atomically replace a plaintext file.
	 *
	 * @param normalizedPath Vault-relative file path.
	 * @param fn Synchronous content transformation.
	 * @param options Optional timestamps.
	 * @returns The new content.
	 */
	async process(normalizedPath: string, fn: (data: string) => string, options?: DataWriteOptions): Promise<string> {
		const target = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(target);
		const result = fn(await readFile(target, "utf8"));
		const temporary = path.join(path.dirname(target), `.${path.basename(target)}.${randomUUID()}.tmp`);
		await writeFile(temporary, result, { encoding: "utf8", flag: "wx" });
		try {
			await this.applyWriteOptions(temporary, options);
			await rename(temporary, target);
		} catch (error) {
			await rm(temporary, { force: true });
			throw error;
		}
		return result;
	}

	/** @param normalizedPath Vault-relative file path. */
	getResourcePath(normalizedPath: string): string {
		return this.getFilePath(normalizedPath);
	}

	/**
	 * Convert a path to a file URL.
	 *
	 * @param normalizedPath Vault-relative or allowed absolute path.
	 * @returns File URL.
	 */
	getFilePath(normalizedPath: string): string {
		return pathToFileURL(this.getFullPath(normalizedPath)).href;
	}

	/** @param normalizedPath Vault-relative file path. */
	async remove(normalizedPath: string): Promise<void> {
		const target = this.getFullPath(normalizedPath);
		if (target === this.rootPath) throw new Error("Cannot remove the vault root as a file.");
		await this.assertNoSymlink(target);
		await rm(target, { force: false });
	}

	/**
	 * Rename a file or directory.
	 *
	 * @param normalizedPath Existing path.
	 * @param normalizedNewPath Destination path.
	 */
	async rename(normalizedPath: string, normalizedNewPath: string): Promise<void> {
		const source = this.getFullPath(normalizedPath);
		const destination = this.getFullPath(normalizedNewPath);
		await this.assertNoSymlink(source);
		await this.assertNoSymlink(destination);
		await rename(source, destination);
	}

	/**
	 * Copy a file without overwriting an existing destination.
	 *
	 * @param normalizedPath Source file.
	 * @param normalizedNewPath Destination file.
	 */
	async copy(normalizedPath: string, normalizedNewPath: string): Promise<void> {
		const source = this.getFullPath(normalizedPath);
		const destination = this.getFullPath(normalizedNewPath);
		await this.assertNoSymlink(source);
		await this.assertNoSymlink(destination);
		await copyFile(source, destination, constants.COPYFILE_EXCL);
	}

	/**
	 * Check whether a path exists.
	 *
	 * @param normalizedPath Vault-relative or allowed absolute path.
	 * @param sensitive Whether path casing must match exactly.
	 * @returns Whether the path exists.
	 */
	async exists(normalizedPath: string, sensitive = false): Promise<boolean> {
		const target = this.getFullPath(normalizedPath);
		try {
			await this.assertNoSymlink(target);
			await access(target);
			return true;
		} catch (error) {
			if (!isNotFound(error)) throw error;
			if (sensitive || (this.allowAbsolutePaths && path.isAbsolute(normalizedPath))) return false;
			const insensitive = await this.findCaseInsensitivePath(normalizedPath);
			return insensitive !== null;
		}
	}

	/**
	 * Retrieve filesystem metadata.
	 *
	 * @param normalizedPath Vault-relative or allowed absolute path.
	 * @returns File or folder metadata, or null when missing.
	 */
	async stat(normalizedPath: string): Promise<Stat | null> {
		const target = this.getFullPath(normalizedPath);
		try {
			await this.assertNoSymlink(target);
			const info = await statFile(target);
			if (!info.isFile() && !info.isDirectory()) throw new Error(`Unsupported filesystem entry: ${normalizedPath}`);
			return {
				type: info.isDirectory() ? "folder" : "file",
				ctime: info.birthtimeMs,
				mtime: info.mtimeMs,
				size: info.size,
			};
		} catch (error) {
			if (isNotFound(error)) return null;
			throw error;
		}
	}

	/**
	 * List direct files and folders.
	 *
	 * @param normalizedPath Vault-relative directory path.
	 * @returns Child paths relative to the vault root.
	 */
	async list(normalizedPath: string): Promise<ListedFiles> {
		const directory = this.getFullPath(normalizedPath);
		await this.assertNoSymlink(directory);
		const entries = await readdir(directory, { withFileTypes: true });
		const files: string[] = [];
		const folders: string[] = [];
		const logicalDirectory = this.toLogicalPath(normalizedPath);
		for (const entry of entries) {
			if (entry.isSymbolicLink()) continue;
			const child = logicalDirectory ? `${logicalDirectory}/${entry.name}` : entry.name;
			if (entry.isDirectory()) folders.push(child);
			else if (entry.isFile()) files.push(child);
		}
		files.sort();
		folders.sort();
		return { files, folders };
	}

	/**
	 * Resolve a path on disk.
	 *
	 * @param normalizedPath Vault-relative or allowed absolute path.
	 * @returns Resolved filesystem path.
	 */
	getFullPath(normalizedPath: string): string {
		if (typeof normalizedPath !== "string" || normalizedPath.includes("\0")) {
			throw new TypeError("Path must be a string without null bytes.");
		}
		const portablePath = normalizedPath.replaceAll("\\", "/");
		if (path.isAbsolute(portablePath)) {
			if (!this.allowAbsolutePaths) throw new Error("Absolute paths are disabled.");
			return path.resolve(portablePath);
		}
		const target = path.resolve(this.rootPath, portablePath);
		if (!isWithin(this.rootPath, target)) throw new Error("Path escapes the vault root.");
		return target;
	}

	/**
	 * Read a local file.
	 *
	 * @param filePath Absolute filesystem path.
	 * @returns File bytes.
	 */
	static async readLocalFile(filePath: string): Promise<ArrayBuffer> {
		const buffer = await readFile(filePath);
		return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
	}

	/**
	 * Create a directory recursively.
	 *
	 * @param directoryPath Absolute filesystem path.
	 */
	static async mkdir(directoryPath: string): Promise<void> {
		await mkdir(directoryPath, { recursive: true });
	}

	private async applyWriteOptions(filePath: string, options?: DataWriteOptions): Promise<void> {
		if (options?.mtime !== undefined) {
			const info = await statFile(filePath);
			await utimes(filePath, info.atime, options.mtime / 1000);
		}
	}

	private async assertNoSymlink(target: string): Promise<void> {
		if (!isWithin(this.rootPath, target)) return;
		let current = this.rootPath;
		const relative = path.relative(this.rootPath, target);
		for (const part of relative.split(path.sep).filter(Boolean)) {
			current = path.join(current, part);
			try {
				if ((await lstat(current)).isSymbolicLink()) throw new Error(`Symlink paths are not allowed: ${current}`);
			} catch (error) {
				if (isNotFound(error)) return;
				throw error;
			}
		}
	}

	private async findCaseInsensitivePath(normalizedPath: string): Promise<string | null> {
		const requested = normalizedPath.replaceAll("\\", "/").split("/").filter(Boolean);
		let current = this.rootPath;
		for (const part of requested) {
			let entries: string[];
			try {
				entries = await readdir(current);
			} catch (error) {
				if (isNotFound(error)) return null;
				throw error;
			}
			const match = entries.find((entry) => entry.toLocaleLowerCase() === part.toLocaleLowerCase());
			if (!match) return null;
			current = path.join(current, match);
		}
		try {
			await this.assertNoSymlink(current);
			await access(current);
			return current;
		} catch (error) {
			if (isNotFound(error)) return null;
			throw error;
		}
	}

	private toLogicalPath(normalizedPath: string): string {
		if (path.isAbsolute(normalizedPath)) {
			const absolutePath = this.getFullPath(normalizedPath);
			return path.relative(this.rootPath, absolutePath).split(path.sep).join("/");
		}
		return normalizedPath.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
	}

	private async pathExists(filePath: string): Promise<boolean> {
		try {
			await access(filePath);
			return true;
		} catch (error) {
			if (isNotFound(error)) return false;
			throw error;
		}
	}
}

function isWithin(root: string, target: string): boolean {
	const relative = path.relative(root, target);
	return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function isNotFound(error: unknown): boolean {
	return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
