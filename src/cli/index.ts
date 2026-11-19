#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { runCli } from "./run.js";

export { runCli } from "./run.js";

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	process.exitCode = await runCli(process.argv.slice(2));
}
