import { Placeholder } from "../unsupported/placeholder.js";
import { DataWriteOptions } from "./adapter.js";

type Vault = Placeholder;

/**
 * This can be either a {@link TFile} or a {@link TFolder}.
 * @public
 * @since 0.9.7
 */
export interface TAbstractFile {
	/**
	 * The vault.
	 * @public
	 * @since 0.9.7
	 */
	vault: Vault;

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
}

/**
 * A folder.
 * @public
 * @since 0.9.7
 */
export interface TFolder extends TAbstractFile {
	/**
	 * The files and folders directly inside this folder.
	 * @public
	 * @since 0.9.7
	 */
	children: TAbstractFile[];

	/**
	 * Check if the folder is the root folder.
	 * @public
	 * @since 0.9.7
	 */
	isRoot(): boolean;
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
export interface TFile extends TAbstractFile {
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
}

/**
 * Represents a file that is outside the Vault.
 * Can be used with the vault API just like any other file.
 * Do not create these manually.
 *
 * @public
 * @since 1.14.4
 */
export interface TExternalFile extends TFile {
	/**
	 * Returns the physical path in the filesystem
	 * @public
	 * @since 1.14.4
	 */
	getRealPath(): string;
}

/**
 * Manage the creation, deletion and renaming of files from the UI.
 * @public
 * @since 0.9.7
 */
export class FileManager {
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
	processFrontMatter(file: TFile, fn: (frontmatter: any) => void, options?: DataWriteOptions): Promise<void> {
		throw new Error("Method not implemented.");
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
	getAvailablePathForAttachment(filename: string, sourcePath?: string): Promise<string> {
		throw new Error("Method not implemented.");
	}
}
