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
		if (relativePath !== undefined) this.path = relativePath;
	}
}

export const ErrorCode = {
	LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
	VAULT_CHANGED: "VAULT_CHANGED",
	INVALID_ENCODING: "INVALID_ENCODING",
	INVALID_FRONTMATTER: "INVALID_FRONTMATTER",
	INVALID_EDGE: "INVALID_EDGE",
	INVALID_QUERY: "INVALID_QUERY",
	INVALID_OPTIONS: "INVALID_OPTIONS",
	INVALID_PATH: "INVALID_PATH",
	NOT_FOUND: "NOT_FOUND",
	UNSAFE_PATH: "UNSAFE_PATH",
	UNRESOLVED_EDGE: "UNRESOLVED_EDGE",
	UNSUPPORTED_PLATFORM: "UNSUPPORTED_PLATFORM",
	VAULT_READ_ERROR: "VAULT_READ_ERROR",
} as const;

/**
 * Throw a `VaultQueryError` with the supplied details.
 * @param code Stable machine-readable error category.
 * @param message Human-readable explanation.
 * @param relativePath Vault-relative path associated with the error, if any.
 */
export function fail(
	code: string,
	message: string,
	relativePath?: string,
): never {
	throw new VaultQueryError(code, message, relativePath);
}
