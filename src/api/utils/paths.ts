import { ErrorCode, VaultQueryError } from "./errors.js";

/**
 * Validate and return a vault-relative POSIX path.
 * @param value Path to validate.
 * @param allowEmpty Whether the empty path, representing the vault root, is allowed.
 */
export function validatePath(value: string, allowEmpty = false): string {
	if (
		typeof value !== "string" ||
		(!allowEmpty && !value) ||
		value.includes("\\") ||
		value.includes("\0") ||
		value.startsWith("/") ||
		/^[a-z]:/i.test(value) ||
		value?.split("/").some((part) => !part || part === "." || part === "..")
	) {
		throw new VaultQueryError(
			ErrorCode.INVALID_PATH,
			"Expected a vault-relative POSIX path.",
		);
	}
	return value;
}
