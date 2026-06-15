import { describe, expectTypeOf, test } from "vitest"
import Jaset, { type EventMap } from "../src/index"
import { BarEvent, FooEvent, TestTarget, WildcardTarget } from "./fixtures"

describe("event type safety", () => {
	test("accepts declared event types", () => {
		const target = new TestTarget()

		target.on("foo", () => {})
		target.on("bar", () => {})
		target.addEventListener("foo", () => {})
		target.once("bar", () => {})
		target.off("foo", () => {})
		target.clear("bar")
		target.mute("foo")
		target.unmute("bar")
	})

	test("rejects undeclared event types", () => {
		const target = new TestTarget()

		// @ts-expect-error - "baz" is not part of the event map
		target.on("baz", () => {})
		// @ts-expect-error - "baz" is not part of the event map
		target.mute("baz")
		// @ts-expect-error - "baz" is not part of the event map
		target.clear("baz")
	})

	test("narrows the event payload to the listener's event type", () => {
		const target = new TestTarget()

		target.on("foo", (event) => {
			expectTypeOf(event).toEqualTypeOf<FooEvent>()
		})
		target.on("bar", (event) => {
			expectTypeOf(event).toEqualTypeOf<BarEvent>()
		})
	})

	test("only allows emitting events declared in the event map", () => {
		const target = new TestTarget()

		target.emit(new FooEvent())
		target.dispatchEvent(new BarEvent())

		// @ts-expect-error - a plain event is not part of the event map
		target.emit(new Event("baz"))
	})

	test("types the `mutedEventTypes` set", () => {
		const target = new TestTarget()

		expectTypeOf(target.mutedEventTypes).toEqualTypeOf<
			ReadonlySet<"foo" | "bar">
		>()
	})

	test("types the `mute` parameter", () => {
		const target = new TestTarget()

		expectTypeOf(target.mute).parameter(0).toEqualTypeOf<"foo" | "bar">()
	})
})

describe("the default event map", () => {
	class DefaultTarget extends Jaset<EventMap> {}

	test("permits no event types", () => {
		const target = new DefaultTarget()

		expectTypeOf(target.mute).parameter(0).toEqualTypeOf<never>()

		// @ts-expect-error - the default event map declares no event types
		target.on("anything", () => {})
	})
})

describe("the wildcard event type", () => {
	test("is disallowed by default", () => {
		const target = new TestTarget()

		// @ts-expect-error - the wildcard type is disallowed by default
		target.on("*", () => {})
		// @ts-expect-error - the wildcard type is disallowed by default
		target.mute("*")
	})

	test("is allowed when enabled", () => {
		const target = new WildcardTarget()

		target.on("*", () => {})
		target.mute("*")
		target.clear("*")
	})

	test("narrows a wildcard listener to the union of all events", () => {
		const target = new WildcardTarget()

		target.on("*", (event) => {
			expectTypeOf(event).toEqualTypeOf<FooEvent | BarEvent>()
		})
	})

	test("includes the wildcard in the `mute` parameter", () => {
		const target = new WildcardTarget()

		expectTypeOf(target.mute)
			.parameter(0)
			.toEqualTypeOf<"foo" | "bar" | "*">()
	})
})
