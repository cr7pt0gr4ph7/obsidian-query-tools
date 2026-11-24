import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import typescript2 from "rollup-plugin-typescript2";
import webWorker from "rollup-plugin-web-worker-loader";

const BASE_CONFIG = {
	input: "dataview/src/main.ts",
	external: ["obsidian", "@codemirror/view", "@codemirror/state", "@codemirror/language", "node:worker_threads"],
	onwarn: (warning, warn) => {
		// Sorry rollup, but we're using eval...
		if (/Use of eval is strongly discouraged/.test(warning.message)) {
			return;
		}
		warn(warning);
	},
};

const getRollupPlugins = (tsconfig, ...plugins) =>
	[
		typescript2(tsconfig),
		nodeResolve({ browser: true }),
		commonjs(),
		webWorker({ 
			inline: true,
			forceInline: true,
			preserveSource: true,
			targetPlatform: "node",
	    }),
	].concat(plugins);

const LIBRARY_CONFIG = {
	...BASE_CONFIG,
	input: "dataview/src/index.ts",
	output: {
		dir: "../../dist/lib/dataview/lib",
		sourcemap: true,
		format: "cjs",
		name: "Dataview (Library)",
	},
	plugins: getRollupPlugins(
		{ tsconfig: "dataview/tsconfig-lib.json" },
		copy({
			targets: [
				{ src: "dataview/src/typings/*.d.ts", dest: "../../dist/lib/dataview/lib/typings" },
				{ src: "package.json", dest: "../../dist/lib/dataview" },
				{ src: "dataview/manifest.json", dest: "../../dist/lib/dataview" },
			],
		}),
	),
};

const configs = [LIBRARY_CONFIG];

export default configs;
