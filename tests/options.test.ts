import { describe, expect, it, vi } from "vitest"
import { FooEvent, TestTarget } from "./fixtures"

describe("listener options", () => {
	it("supports the `passive` option", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener, { passive: true })
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})

	it("invokes a capturing listener", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener, { capture: true })
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})
})

describe("the `signal` option", () => {
	it("does not register a listener for an already-aborted signal", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener, { signal: AbortSignal.abort() })

		expect(target.eventListeners.has("foo")).toBe(false)

		target.emit(new FooEvent())
		expect(listener).not.toHaveBeenCalled()
	})

	it("removes a listener when its signal is aborted", () => {
		const target = new TestTarget()
		const controller = new AbortController()
		const listener = vi.fn()

		target.on("foo", listener, { signal: controller.signal })
		expect(target.eventListeners.has("foo")).toBe(true)

		controller.abort()
		expect(target.eventListeners.has("foo")).toBe(false)

		target.emit(new FooEvent())
		expect(listener).not.toHaveBeenCalled()
	})

	it("removes its abort subscription when the listener is removed", () => {
		const target = new TestTarget()
		const controller = new AbortController()
		const removeEventListener = vi.spyOn(
			controller.signal,
			"removeEventListener",
		)
		const listener = vi.fn()

		target.on("foo", listener, { signal: controller.signal })
		target.off("foo", listener)

		expect(removeEventListener).toHaveBeenCalledTimes(1)
	})
})
