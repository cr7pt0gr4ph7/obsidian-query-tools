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
		if (currentPart > minimumPart) {
			return 1;
		}
		if (currentPart < minimumPart) {
			return -1;
		}
	}
	return 0;
}
