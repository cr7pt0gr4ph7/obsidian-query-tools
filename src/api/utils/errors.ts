/** An actionable error raised by the shared vault-query API. */
export class VaultQueryError extends Error {
	/** Stable machine-readable error category. */
	readonly code: string;
	/** Vault-relative path associated with the error, when applicable. */
	declare readonly path?: string;

	/**
	 * Create a structured query error.
	 *
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

export const Errors = {
	Files: {
		UnsafePath(message = "Unsafe path.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.UNSAFE_PATH, message, relativePath);
		},
		InvalidPath(message = "Expected a vault-relative POSIX path.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.INVALID_PATH, message, relativePath);
		},
		InvalidEncoding(message = "Invalid text encoding.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.INVALID_ENCODING, message, relativePath);
		},
		SizeExceeded(message = "File size exceeded.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.LIMIT_EXCEEDED, message, relativePath);
		},
	},
	Frontmatter: {
		InvalidFrontmatter(message = "Invalid frontmatter.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.INVALID_FRONTMATTER, message, relativePath);
		},
	},
	General: {
		UnsupportedFeature(message = "This feature is not supported.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.UNSUPPORTED_FEATURE, message, relativePath);
		},
		UnsupportedPlatform(message = "This platform is not supported.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.UNSUPPORTED_PLATFORM, message, relativePath);
		},
		InternalError(message = "An unexpected error occurred.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.INTERNAL_ERROR, message, relativePath);
		},
	},
	Limits: {
		Exceeded(message = "Resource limit exceeded.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.LIMIT_EXCEEDED, message, relativePath);
		},
	},
	Graph: {
		InvalidEdge(message = "Invalid edge.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.INVALID_EDGE, message, relativePath);
		},
		UnresolvedEdgeTarget(message = "Edge target is not indexed.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.UNRESOLVED_EDGE, message, relativePath);
		},
		UnresolvedNode(message = "The requested item was not found.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.NOT_FOUND, message, relativePath);
		},
	},
	Options: {
		InvalidOptions(message = "Invalid options.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.INVALID_OPTIONS, message, relativePath);
		},
	},
	Query: {
		InvalidQuery(message = "Invalid query.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.INVALID_QUERY, message, relativePath);
		},
	},
	Vault: {
		VaultChangedWhileIndexing(message = "The vault changed while indexing.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.VAULT_CHANGED, message, relativePath);
		},
		VaultIsClosed(message = "The vault is closed.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.VAULT_CLOSED, message, relativePath);
		},
		InvalidVault(message = "Invalid vault.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.INVALID_VAULT, message, relativePath);
		},
		ReadError(message = "Could not read the vault.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.VAULT_READ_ERROR, message, relativePath);
		},
		RefreshInProgress(message = "A refresh is already in progress.", relativePath?: string) {
			return new VaultQueryError(ErrorCode.REFRESH_IN_PROGRESS, message, relativePath);
		},
	},
	is(error: unknown): error is VaultQueryError {
		return error instanceof VaultQueryError;
	},
	codes(): string[] {
		return Object.values(ErrorCode).sort();
	},
};
