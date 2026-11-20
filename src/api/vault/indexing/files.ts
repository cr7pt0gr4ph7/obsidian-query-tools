import type { Stats } from "node:fs";
import { constants } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import { lstat, open } from "node:fs/promises";
import path from "node:path";
import { Errors } from "../../utils/errors.js";

/**
 * Compare strings using deterministic code-unit ordering.
 *
 * @param a First string.
 * @param b Second string.
 * @returns A negative number when `a` sorts first, zero when equal, or a positive number when `b` sorts first.
 */
export const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const fdPath = (handle: FileHandle): string => `/proc/self/fd/${handle.fd}`;

/**
 * Create a stable signature from filesystem metadata.
 *
 * @param stat File or directory metadata.
 * @returns A string representing device, inode, size, and change timestamps.
 */
export function signature(stat: Stats): string {
	return `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
}

/**
 * Read a Markdown file through its open parent directory without following symlinks.
 *
 * @param parent Open handle for the containing directory.
 * @param name Entry name relative to the parent directory.
 * @param relativePath Vault-relative path used in diagnostics.
 * @param limit Maximum allowed file size in bytes.
 * @returns The file contents decoded as UTF-8.
 */
export async function readMarkdownFile(
	parent: FileHandle,
	name: string,
	relativePath: string,
	limit: number,
): Promise<string> {
	const anchored = path.join(fdPath(parent), name);
	const stat = await lstat(anchored);
	if (!stat.isFile() || stat.isSymbolicLink()) {
		throw Errors.Files.UnsafePath("Symlinks and special files are not allowed.", relativePath);
	}
	if (stat.size > limit) {
		throw Errors.Files.SizeExceeded("Markdown file exceeds the byte limit.", relativePath);
	}
	const file = await open(anchored, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
	try {
		const before = await file.stat();
		if (!before.isFile() || signature(stat) !== signature(before)) {
			throw Errors.Vault.VaultChangedWhileIndexing("File changed while indexing.", relativePath);
		}
		const buffer = Buffer.alloc(before.size + 1);
		let length = 0;
		while (length < buffer.length) {
			const { bytesRead } = await file.read(buffer, length, buffer.length - length, length);
			if (!bytesRead) {
				break;
			}
			length += bytesRead;
		}
		if (length > limit) {
			throw Errors.Files.SizeExceeded("Markdown file exceeds the byte limit.", relativePath);
		}
		const after = await file.stat();
		const current = await lstat(anchored);
		if (!current.isFile() || signature(before) !== signature(after) || signature(after) !== signature(current)) {
			throw Errors.Vault.VaultChangedWhileIndexing("File changed while indexing.", relativePath);
		}
		try {
			return new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, length));
		} catch {
			throw Errors.Files.InvalidEncoding("Markdown file is not valid UTF-8.", relativePath);
		}
	} finally {
		await file.close();
	}
}
