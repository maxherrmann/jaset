import { describe, expect, it, vi } from "vitest"
import { FooEvent, TestTarget } from "./fixtures"

describe("dispatching events", () => {
	it("invokes listeners via `emit`", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		const result = target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
		expect(result).toBe(true)
	})

	it("treats `dispatchEvent` as an alias for `emit`", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.addEventListener("foo", listener)
		const result = target.dispatchEvent(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
		expect(result).toBe(true)
	})

	it("returns `false` when a cancelable event is canceled", () => {
		const target = new TestTarget()

		target.on("foo", (event) => event.preventDefault())

		expect(target.emit(new FooEvent())).toBe(false)
	})

	it("returns `true` when a cancelable event is not canceled", () => {
		const target = new TestTarget()

		target.on("foo", () => {})

		expect(target.emit(new FooEvent())).toBe(true)
	})

	it("passes the dispatched event instance to the listener", () => {
		const target = new TestTarget()
		const listener = vi.fn()
		const event = new FooEvent("payload")

		target.on("foo", listener)
		target.emit(event)

		expect(listener.mock.calls[0]?.[0]).toBe(event)
		expect(listener.mock.calls[0]?.[0].detail).toBe("payload")
	})

	it("sets `currentTarget` to the emitting target", () => {
		const target = new TestTarget()
		let currentTarget: EventTarget | null = null

		target.on("foo", (event) => {
			currentTarget = event.currentTarget
		})
		target.emit(new FooEvent())

		expect(currentTarget).toBe(target)
	})
})
