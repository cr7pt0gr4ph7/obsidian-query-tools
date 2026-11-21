/**
 * This is the API version of the app, which follows the release cycle of the desktop app.
 * Example: '0.13.21'
 * @public
 */
export const apiVersion = "1.0.0";

/**
 * Compare two dot-separated numeric version strings.
 * @param current The current version.
 * @param minimum The minimum version.
 * @returns `1` if current is newer, `-1` if it is older, and `0` if they are equal.
 */
export function compareVersions(current: string, minimum: string): number {
	if (!/^\d+(?:\.\d+)*$/.test(current) || !/^\d+(?:\.\d+)*$/.test(minimum)) {
		throw new TypeError("Versions must contain only numeric dot-separated components.");
	}
	const currentParts = current.split(".").map((part) => Number.parseInt(part, 10));
	const minimumParts = minimum.split(".").map((part) => Number.parseInt(part, 10));
	const length = Math.max(currentParts.length, minimumParts.length);
	for (let index = 0; index < length; index++) {
		const currentPart = currentParts[index] ?? 0;
		const minimumPart = minimumParts[index] ?? 0;
		if (!Number.isFinite(currentPart) || !Number.isFinite(minimumPart)) {
			throw new TypeError("Versions must contain only numeric dot-separated components.");
		}
		if (currentPart > minimumPart) return 1;
		if (currentPart < minimumPart) return -1;
	}
	return 0;
}

/**
 * Returns `true` if the API version is equal to or higher than the requested version.
 * Use this to limit functionality that require specific API versions to avoid
 * crashing on older Obsidian builds.
 * @param version The minimum version.
 * @example
 * ```ts
 * console.log(requireApiVersion('1.0.0')); // true
 * ```
 * @public
 */
export function requireApiVersion(version: string): boolean {
	return compareVersions(apiVersion, version) >= 0;
}
