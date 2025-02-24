import esBuild from "esbuild"

const buildDate = new Date()

await esBuild.build({
	banner: {
		js:
			`/**\n` +
			` * jaset ` +
			`${process.env.npm_package_version}\n` +
			` * Copyright (c) ${buildDate.getFullYear()} ` +
			`Max Herrmann\n` +
			` * https://github.com/maxherrmann/jaset/blob/main/LICENSE\n` +
			` * (Built on ${buildDate.toUTCString()})\n` +
			` */`,
	},
	entryPoints: ["src/index.ts"],
	format: "esm",
	minify: true,
	outfile: "dist/index.js",
	sourcemap: true,
	target: "es2019",
})
