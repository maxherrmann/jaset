import Jaset, { type EventMap } from "../src/index"

/**
 * A cancelable event whose `type` is narrowed to the literal `"foo"`.
 */
export class FooEvent extends Event {
	readonly type = "foo" as const

	constructor(readonly detail: string = "foo") {
		super("foo", { cancelable: true })
	}
}

/**
 * An event whose `type` is narrowed to the literal `"bar"`.
 */
export class BarEvent extends Event {
	readonly type = "bar" as const

	constructor() {
		super("bar")
	}
}

export type TestEventMap = EventMap<{
	foo: FooEvent
	bar: BarEvent
}>

/**
 * A target that disallows the wildcard event type (the default).
 */
export class TestTarget extends Jaset<TestEventMap> {}

/**
 * A target that allows the wildcard event type.
 */
export class WildcardTarget extends Jaset<TestEventMap, true> {}
