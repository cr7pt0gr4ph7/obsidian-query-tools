import { Errors } from "./errors.js";

/**
 * Validate and return a vault-relative POSIX path.
 * Throws an error if the path is invalid.
 *
 * @param value Path to validate.
 * @param allowEmpty Whether the empty path, representing the vault root, is allowed.
 * @returns The validated path unchanged.
 */
export function validatePath(value: string, allowEmpty = false): string {
	if (
		typeof value !== "string" ||
		(!allowEmpty && !value) ||
		value.includes("\\") ||
		value.includes("\0") ||
		value.startsWith("/") ||
		/^[a-z]:/i.test(value) ||
		(value !== "" && value.split("/").some((part) => !part || part === "." || part === ".."))
	) {
		throw Errors.Files.InvalidPath("Expected a vault-relative POSIX path.", value);
	}
	return value;
}
