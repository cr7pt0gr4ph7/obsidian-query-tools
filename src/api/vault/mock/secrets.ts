import { Events } from "../../../host/obsidian/base/events.js";

/**
 * @public
 * @since 1.11.4
 */
export class SecretStorage extends Events {
	private secrets: Record<string, string> = {};

	/**
	 * Sets a secret in the storage.
	 * @param id Lowercase alphanumeric ID with optional dashes
	 * @param secret The secret value to store
	 * @throws Error if ID is invalid
	 * @public
	 * @since 1.11.4
	 */
	setSecret(id: string, secret: string): void {
		if (!/^[a-z0-9-]+$/.test(id)) {
			throw new Error("Invalid ID");
		}
		this.secrets[id] = secret;
	}

	/**
	 * Gets a secret from storage
	 * @param id The secret ID
	 * @returns The secret value or null if not found
	 * @public
	 * @since 1.11.4
	 */
	getSecret(id: string): string | null {
		return this.secrets[id] ?? null;
	}

	/**
	 * Lists all secrets in storage
	 * @returns Array of secret IDs
	 * @public
	 * @since 1.11.4
	 */
	listSecrets(): string[] {
		return Object.keys(this.secrets);
	}
}
