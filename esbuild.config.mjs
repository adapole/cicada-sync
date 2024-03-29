import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const __dirname = dirname(fileURLToPath(import.meta.url));

const prod = process.argv[2] === "production";

const entryPoint = resolve(__dirname, ".", "src", "main.ts");
const outFile = resolve(__dirname, ".", "main.js");

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: [entryPoint],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins,
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: outFile,
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
