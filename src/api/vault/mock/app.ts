import { Vault } from "../vault.js";
import { FileManager } from "./files/files.js";
import { MetadataCache } from "./metadata.js";
import { SecretStorage } from "./secrets.js";
import { Keymap, Scope } from "./unsupported/keymap.js";
import { UserEvent } from "./unsupported/userevent.js";
import { Workspace } from "./unsupported/workspace.js";
import { RenderContext } from "./unsupported_api.js";

/**
 * The main app object.
 * @public
 * @since 0.9.7
 */
export class App {
	/**
	 * The keymap.
	 * @public
	 * @since 0.9.7
	 */
	keymap: Keymap;

	/**
	 * The root keymap scope of the app.
	 * @public
	 * @since 0.9.7
	 */
	scope: Scope;

	/**
	 * The workspace.
	 * @public
	 * @since 0.9.7
	 */
	workspace: Workspace;

	/**
	 * The vault.
	 * @public
	 * @since 0.9.7
	 */
	vault: Vault;

	/**
	 * @public
	 * @since 0.9.7
	 */
	metadataCache: MetadataCache;

	/**
	 * The file manager.
	 * @public
	 * @since 0.11.0
	 */
	fileManager: FileManager;

	/**
	 * The last known user interaction event, to help commands find out what modifier keys are pressed.
	 * @public
	 * @since 0.12.17
	 */
	lastEvent: UserEvent | null;

	/**
	 * @public
	 * @since 1.10.0
	 */
	renderContext: RenderContext;

	/**
	 * @public
	 * @since 1.11.4
	 */
	secretStorage: SecretStorage;

	/**
	 * @public
	 * @since 1.10.0
	 */
	isDarkMode(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * Retrieve value from `localStorage` for this vault.
	 * @param key The key.
	 * @returns The value, or `null` if it is not set.
	 * @public
	 * @since 1.8.7
	 */
	loadLocalStorage(key: string): any | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Save vault-specific value to `localStorage`. If data is `null`, the entry will be cleared.
	 * @param key The key.
	 * @param data The value. Must be serializable.
	 * @public
	 * @since 1.8.7
	 */
	saveLocalStorage(key: string, data: unknown | null): void {
		throw new Error("Method not implemented.");
	}
}
