import type { AppConfig } from "./app_config.internal.js";
import type { UserEvent } from "./base/userevent.js";
import { MetadataCache } from "./cache/cache.js";
import { Keymap, Scope } from "./compat/editor/keyboard.js";
import { RenderContext } from "./compat/rendercontext.js";
import { SecretStorage } from "./compat/secrets.js";
import { Workspace } from "./compat/workspace/workspace.js";
import { FileSystemAdapter } from "./files/adapter_filesystem.js";
import type { FileManager } from "./files/files.js";
import { Vault } from "./files/vault.js";

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

	constructor(options: AppConfig) {
		const adapter = new FileSystemAdapter(options.basePath, options.allowAbsolutePaths);
		this.vault = new Vault(adapter, options.configDir);
		this.fileManager = this.vault.fileManager;
		this.secretStorage = new SecretStorage();
		this.metadataCache = new MetadataCache();

		this.keymap = new Keymap();
		this.scope = new Scope();
		this.keymap.pushScope(this.scope);
		this.lastEvent = null;

		this.workspace = new Workspace(this);
		this.renderContext = new RenderContext();
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isDarkMode(): boolean {
		// Stub implementation, always return false for now.
		return false;
	}

	/**
	 * Retrieve value from `localStorage` for this vault.
	 * @param key The key.
	 * @returns The value, or `null` if it is not set.
	 * @public
	 * @since 1.8.7
	 */
	loadLocalStorage(key: string): any | null {
		// Stub implementation, always return null for now.
		console.warn("App.loadLocalStorage is not implemented. It was called with key:", key);
		return null;
	}

	/**
	 * Save vault-specific value to `localStorage`. If data is `null`, the entry will be cleared.
	 * @param key The key.
	 * @param data The value. Must be serializable.
	 * @public
	 * @since 1.8.7
	 */
	saveLocalStorage(key: string, data: unknown | null): void {
		// Stub implementation, do nothing for now.
		console.warn("App.saveLocalStorage is not implemented. It was called with key:", key, "and data:", data);
	}
}
