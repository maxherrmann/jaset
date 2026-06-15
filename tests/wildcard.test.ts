import { describe, expect, it, vi } from "vitest"
import { BarEvent, FooEvent, WildcardTarget } from "./fixtures"

describe("the wildcard event type", () => {
	it("invokes a wildcard listener for every event type", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		target.on("*", listener)
		target.emit(new FooEvent())
		target.emit(new BarEvent())

		expect(listener).toHaveBeenCalledTimes(2)
	})

	it("includes wildcard listeners in the listener map under `*`", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		target.on("*", listener)

		expect(target.eventListeners.get("*")).toEqual([listener])
	})

	it("does not register the same wildcard listener twice", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		target.on("*", listener)
		target.on("*", listener)
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
		expect(target.eventListeners.get("*")).toHaveLength(1)
	})

	it("registers the same wildcard listener separately per capture phase", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		target.on("*", listener, { capture: true })
		target.on("*", listener, { capture: false })
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(2)
		expect(target.eventListeners.get("*")).toHaveLength(2)
	})

	it("removes a wildcard listener via `off`", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		target.on("*", listener)
		target.off("*", listener)
		target.emit(new FooEvent())

		expect(listener).not.toHaveBeenCalled()
		expect(target.eventListeners.has("*")).toBe(false)
	})

	it("ignores removal of an unregistered wildcard listener", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		expect(() => target.off("*", listener)).not.toThrow()
	})

	it("invokes a wildcard `once` listener exactly once", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		target.once("*", listener)
		target.emit(new FooEvent())
		target.emit(new BarEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})

	it("removes a wildcard listener when its signal is aborted", () => {
		const target = new WildcardTarget()
		const controller = new AbortController()
		const listener = vi.fn()

		target.on("*", listener, { signal: controller.signal })
		expect(target.eventListeners.has("*")).toBe(true)

		controller.abort()
		expect(target.eventListeners.has("*")).toBe(false)

		target.emit(new FooEvent())
		expect(listener).not.toHaveBeenCalled()
	})

	it("does not register a wildcard listener for an already-aborted signal", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		target.on("*", listener, { signal: AbortSignal.abort() })

		expect(target.eventListeners.has("*")).toBe(false)
	})
})

describe("wildcard dispatch behavior", () => {
	it("skips a wildcard listener removed during the same dispatch", () => {
		const target = new WildcardTarget()
		const order: string[] = []

		const second = () => order.push("second")
		const first = () => {
			order.push("first")
			target.off("*", second)
		}

		target.on("*", first)
		target.on("*", second)
		target.emit(new FooEvent())

		expect(order).toEqual(["first"])
	})

	it("reuses registered listeners during re-entrant dispatch", () => {
		const target = new WildcardTarget()
		const types: string[] = []
		let reentered = false

		target.on("*", (event) => {
			types.push(event.type)

			if (!reentered) {
				reentered = true
				target.emit(new FooEvent())
			}
		})

		target.emit(new FooEvent())

		expect(types).toEqual(["foo", "foo"])
	})
})

describe("clearing and muting via the wildcard event type", () => {
	it("removes all listeners of every event type via `clear`", () => {
		const target = new WildcardTarget()
		const fooListener = vi.fn()
		const wildcardListener = vi.fn()

		target.on("foo", fooListener)
		target.on("*", wildcardListener)
		target.clear("*")
		target.emit(new FooEvent())

		expect(fooListener).not.toHaveBeenCalled()
		expect(wildcardListener).not.toHaveBeenCalled()
		expect(target.eventListeners.size).toBe(0)
	})

	it("mutes every event type via `mute`", () => {
		const target = new WildcardTarget()
		const fooListener = vi.fn()
		const wildcardListener = vi.fn()

		target.on("foo", fooListener)
		target.on("*", wildcardListener)
		target.mute("*")
		target.emit(new FooEvent())
		target.emit(new BarEvent())

		expect(fooListener).not.toHaveBeenCalled()
		expect(wildcardListener).not.toHaveBeenCalled()
	})

	it("does not populate `mutedEventTypes` when muting via the wildcard", () => {
		const target = new WildcardTarget()

		target.mute("*")
		expect(target.mutedEventTypes.size).toBe(0)
	})

	it("unmutes all event types, including individually muted ones", () => {
		const target = new WildcardTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		target.mute("foo")
		target.mute("*")
		target.unmute("*")
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
		expect(target.mutedEventTypes.size).toBe(0)
	})
})
