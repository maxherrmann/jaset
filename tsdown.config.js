import { defineConfig } from "tsdown"

const buildDate = new Date()

export default defineConfig({
	attw: {
		level: "error",
		profile: "esm-only",
	},
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
	clean: true,
	entry: ["./src/index.ts"],
	outDir: "./dist",
	platform: "neutral",
	publint: {
		level: "error",
		strict: true,
	},
	sourcemap: true,
})
