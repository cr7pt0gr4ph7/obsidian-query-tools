/** An actionable error raised by the shared vault-query API. */
export class VaultQueryError extends Error {
	/** Stable machine-readable error category. */
	readonly code: string;
	/** Vault-relative path associated with the error, when applicable. */
	declare readonly path?: string;

	/**
	 * Create a structured query error.
	 * @param code Stable machine-readable error category.
	 * @param message Human-readable explanation.
	 * @param relativePath Vault-relative path associated with the error, if any.
	 */
	constructor(code: string, message: string, relativePath?: string) {
		super(message);
		this.name = "VaultQueryError";
		this.code = code;
		if (relativePath !== undefined) {
			this.path = relativePath;
		}
	}
}

export const ErrorCode = {
	INTERNAL_ERROR: "INTERNAL_ERROR",
	INVALID_EDGE: "INVALID_EDGE",
	INVALID_ENCODING: "INVALID_ENCODING",
	INVALID_FRONTMATTER: "INVALID_FRONTMATTER",
	INVALID_OPTIONS: "INVALID_OPTIONS",
	INVALID_PATH: "INVALID_PATH",
	INVALID_QUERY: "INVALID_QUERY",
	INVALID_VAULT: "INVALID_VAULT",
	LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
	NOT_FOUND: "NOT_FOUND",
	REFRESH_IN_PROGRESS: "REFRESH_IN_PROGRESS",
	UNRESOLVED_EDGE: "UNRESOLVED_EDGE",
	UNSAFE_PATH: "UNSAFE_PATH",
	UNSUPPORTED_FEATURE: "UNSUPPORTED_FEATURE",
	UNSUPPORTED_PLATFORM: "UNSUPPORTED_PLATFORM",
	VAULT_CHANGED: "VAULT_CHANGED",
	VAULT_CLOSED: "VAULT_CLOSED",
	VAULT_READ_ERROR: "VAULT_READ_ERROR",
} as const;
