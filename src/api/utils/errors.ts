import { INTERNAL_ERROR } from "@modelcontextprotocol/server";

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
	INTERNAL_ERROR: "INTERNAL_ERROR",
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
	REFRESH_IN_PROGRESS: "REFRESH_IN_PROGRESS",
	INVALID_VAULT: "INVALID_VAULT",
	VAULT_CLOSED: "VAULT_CLOSED",
} as const;
