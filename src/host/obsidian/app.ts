import type { Scope } from "./compat/editor/keyboard.js";
import type { FileManager } from "./files/files.js";
import type { Vault } from "./files/vault.js";

export class App {
	declare vault: Vault;
	declare scope: Scope;
	declare fileManager: FileManager;
}
