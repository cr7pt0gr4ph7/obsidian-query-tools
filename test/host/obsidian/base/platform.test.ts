import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { Platform } from "../../../../src/host/obsidian/base/platform.ts";

suite("Platform utilities", () => {
	test("mock platform identifies Linux desktop only", () => {
		assert.equal(Platform.isDesktop, true);
		assert.equal(Platform.isLinux, true);
		assert.equal(Platform.isMobile, false);
		assert.equal(Platform.isDesktopApp, false);
		assert.equal(Platform.isMobileApp, false);
		assert.equal(Platform.isIosApp, false);
		assert.equal(Platform.isAndroidApp, false);
		assert.equal(Platform.isPhone, false);
		assert.equal(Platform.isTablet, false);
		assert.equal(Platform.isMacOS, false);
		assert.equal(Platform.isWin, false);
		assert.equal(Platform.isSafari, false);
	});
});
