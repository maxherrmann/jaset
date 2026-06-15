import { describe, expect, it, vi } from "vitest"
import { BarEvent, FooEvent, TestTarget } from "./fixtures"

describe("adding and removing event listeners", () => {
	it("invokes a registered listener when its event is emitted", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		const event = new FooEvent()
		target.emit(event)

		expect(listener).toHaveBeenCalledTimes(1)
		expect(listener).toHaveBeenCalledWith(event)
	})

	it("treats `addEventListener` as an alias for `on`", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.addEventListener("foo", listener)
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})

	it("ignores a `null` callback when adding a listener", () => {
		const target = new TestTarget()

		target.on("foo", null)
		target.addEventListener("foo", null)

		expect(target.eventListeners.size).toBe(0)
	})

	it("does not register the same listener twice", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		target.on("foo", listener)
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
		expect(target.eventListeners.get("foo")).toHaveLength(1)
	})

	it("registers the same listener separately per capture phase", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener, { capture: true })
		target.on("foo", listener, { capture: false })

		expect(target.eventListeners.get("foo")).toHaveLength(2)

		target.emit(new FooEvent())

		// Both the capturing and bubbling registrations are invoked.
		expect(listener).toHaveBeenCalledTimes(2)
	})

	it("removes a listener via `off`", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		target.off("foo", listener)
		target.emit(new FooEvent())

		expect(listener).not.toHaveBeenCalled()
		expect(target.eventListeners.has("foo")).toBe(false)
	})

	it("treats `removeEventListener` as an alias for `off`", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.addEventListener("foo", listener)
		target.removeEventListener("foo", listener)
		target.emit(new FooEvent())

		expect(listener).not.toHaveBeenCalled()
	})

	it("removes a listener registered with a boolean capture option", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener, true)
		target.off("foo", listener, true)
		target.emit(new FooEvent())

		expect(listener).not.toHaveBeenCalled()
	})

	it("ignores a `null` callback when removing a listener", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		target.off("foo", null)
		target.emit(new FooEvent())

		expect(listener).toHaveBeenCalledTimes(1)
	})

	it("ignores removal for an event type with no listeners", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		expect(() => target.off("bar", listener)).not.toThrow()
	})

	it("ignores removal of an unregistered listener", () => {
		const target = new TestTarget()
		const registered = vi.fn()
		const unregistered = vi.fn()

		target.on("foo", registered)
		target.off("foo", unregistered)

		expect(target.eventListeners.get("foo")).toHaveLength(1)
	})

	it("supports listener objects with `handleEvent`", () => {
		const target = new TestTarget()
		const handleEvent = vi.fn()

		target.on("foo", { handleEvent })
		target.emit(new FooEvent())

		expect(handleEvent).toHaveBeenCalledTimes(1)
	})
})

describe("the event listener map", () => {
	it("exposes active listeners keyed by event type", () => {
		const target = new TestTarget()
		const fooListener = vi.fn()
		const barListener = vi.fn()

		target.on("foo", fooListener)
		target.on("bar", barListener)

		expect([...target.eventListeners.keys()]).toEqual(["foo", "bar"])
		expect(target.eventListeners.get("foo")).toEqual([fooListener])
		expect(target.eventListeners.get("bar")).toEqual([barListener])
	})

	it("removes an event type after its last listener is removed", () => {
		const target = new TestTarget()
		const listener = vi.fn()

		target.on("foo", listener)
		expect(target.eventListeners.has("foo")).toBe(true)

		target.off("foo", listener)
		expect(target.eventListeners.has("foo")).toBe(false)
	})
})

describe("clearing event listeners", () => {
	it("removes every listener for an event type", () => {
		const target = new TestTarget()
		const a = vi.fn()
		const b = vi.fn()

		target.on("foo", a)
		target.on("foo", b, { capture: true })
		target.clear("foo")
		target.emit(new FooEvent())

		expect(a).not.toHaveBeenCalled()
		expect(b).not.toHaveBeenCalled()
		expect(target.eventListeners.has("foo")).toBe(false)
	})

	it("leaves other event types untouched", () => {
		const target = new TestTarget()
		const fooListener = vi.fn()
		const barListener = vi.fn()

		target.on("foo", fooListener)
		target.on("bar", barListener)
		target.clear("foo")
		target.emit(new FooEvent())
		target.emit(new BarEvent())

		expect(fooListener).not.toHaveBeenCalled()
		expect(barListener).toHaveBeenCalledTimes(1)
	})

	it("ignores clearing an event type with no listeners", () => {
		const target = new TestTarget()

		expect(() => target.clear("foo")).not.toThrow()
	})
})
