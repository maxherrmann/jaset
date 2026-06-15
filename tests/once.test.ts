import { describe, expect, it, vi } from "vitest"
import { FooEvent, TestTarget } from "./fixtures"

describe("`once` listeners", () => {
	it("invokes the listener exactly once", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.once("foo", listener)
		target.emit(new FooEvent())
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})

	it("removes the listener from the listener map after invocation", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.once("foo", listener)
		expect(target.eventListeners.has("foo")).toBe(true)

		target.emit(new FooEvent())
		expect(target.eventListeners.has("foo")).toBe(false)
	})

	it("treats `addEventListener` with the `once` option as an alias for `once`", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.addEventListener("foo", listener, { once: true })
		target.emit(new FooEvent())
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})

	it("supports a boolean capture option", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.once("foo", listener, true)
		target.emit(new FooEvent())
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})

	it("preserves a muted listener until invoked while unmuted", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.once("foo", listener)
		target.mute("foo")

		// Muted: the listener is ignored but not consumed.
		target.emit(new FooEvent())
		expect(listener).not.toHaveBeenCalled()
		expect(target.eventListeners.has("foo")).toBe(true)

		target.unmute("foo")
		target.emit(new FooEvent())
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})
})
