import { compareVersions } from "./api_version.internal.js";

/**
 * This is the API version of the app, which follows the release cycle of the desktop app.
 * Example: '0.13.21'
 * @public
 */
export const apiVersion = "1.0.0";

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
