import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
		typecheck: {
			enabled: true,
			tsconfig: "./tests/tsconfig.test.json",
			include: ["tests/**/*.test-d.ts"],
		},
		coverage: {
			provider: "v8",
			include: ["src/**/*.ts"],
			reporter: ["text", "text-summary", "html"],
			thresholds: {
				100: true,
			},
		},
	},
})
