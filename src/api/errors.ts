export class VaultQueryError extends Error {
	readonly code: string;
	declare readonly path?: string;

	constructor(code: string, message: string, relativePath?: string) {
		super(message);
		this.name = "VaultQueryError";
		this.code = code;
		if (relativePath !== undefined) this.path = relativePath;
	}
}

export function fail(
	code: string,
	message: string,
	relativePath?: string,
): never {
	throw new VaultQueryError(code, message, relativePath);
}
