import { describe, expect, it } from "vitest"
import Jaset, { EventTarget } from "../src/index"

describe("package exports", () => {
	it("exposes the event target as the default export", () => {
		expect(typeof Jaset).toBe("function")
		expect(new Jaset()).toBeInstanceOf(EventTarget)
	})

	it("exposes the same class as the named `EventTarget` export", () => {
		expect(EventTarget).toBe(Jaset)
	})

	it("extends the global `EventTarget`", () => {
		expect(new Jaset()).toBeInstanceOf(globalThis.EventTarget)
	})
})
