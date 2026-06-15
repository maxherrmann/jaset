import { describe, expect, it, vi } from "vitest"
import { BarEvent, FooEvent, TestTarget } from "./fixtures"

describe("muting events", () => {
	it("prevents listeners from being invoked while muted", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		target.mute("foo")
		target.emit(new FooEvent())

		expect(listener).not.toHaveBeenCalled()
	})

	it("resumes invoking listeners after unmuting", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		target.mute("foo")
		target.emit(new FooEvent())
		target.unmute("foo")
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})

	it("only mutes the specified event type", () => {
		const target = new TestTarget()
		const fooListener = vi.fn()
		const barListener = vi.fn()

		target.on("foo", fooListener)
		target.on("bar", barListener)
		target.mute("foo")
		target.emit(new FooEvent())
		target.emit(new BarEvent())

		expect(fooListener).not.toHaveBeenCalled()
		expect(barListener).toHaveBeenCalledTimes(1)
	})

	it("exposes explicitly muted event types", () => {
		const target = new TestTarget()

		target.mute("foo")
		expect([...target.mutedEventTypes]).toEqual(["foo"])

		target.unmute("foo")
		expect(target.mutedEventTypes.size).toBe(0)
	})

	it("remains muted even when it has no listeners", () => {
		const target = new TestTarget()

		target.mute("foo")
		expect(target.mutedEventTypes.has("foo")).toBe(true)

		const listener = vi.fn()
		target.on("foo", listener)
		target.emit(new FooEvent())

		expect(listener).not.toHaveBeenCalled()
	})
})
