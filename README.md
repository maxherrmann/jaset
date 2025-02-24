<p align="center">
	<img src="https://max-herrmann.com/deploy/jaset/jaset_logo.png?0" height="75" alt="jaset">
</p>
<p align="center">
    <a href="https://www.npmjs.org/package/jaset">
    	<img src="https://img.shields.io/npm/v/jaset.svg" alt="npm">
    </a>
</p>

**jaset** (_just a strict event target_) is a simple, type-safe implementation of [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) with zero dependencies and select enhancements<sup>✨</sup> for a better developer experience — including short-form method names, event muting, an optional wildcard event type and more.

## Installation

```sh
npm i jaset
```

See [Package exports](#package-exports) for a list of all package exports.

## Usage

You can use **jaset** just like you would use `EventTarget` with the addition of providing an event map.

```ts
import EventTarget, { type EventMap } from "jaset"

class MyEventTarget extends EventTarget<MyEventMap> {}

type MyEventMap = EventMap<{
	"my-event": MyEvent
}>

const myEventTarget = new MyEventTarget()

// ✅ "my-event" is a valid event type: No complaints.
myEventTarget.on("my-event", (event) => {
	// ✅ event is `MyEvent` and not just any `Event`.
})

// ⛔️ "foo" is not a valid event type: TypeScript error.
myEventTarget.on("foo", (event) => {
	// ...
})
```

### Define custom events

**jaset** supports events that extend [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event).

```ts
class MyEvent extends Event {
	constructor() {
		super("my-event")
	}
}
```

If you prefer to use [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), just use it directly in your event map.

```ts
type MyEventMap = EventMap<{
	"my-event": CustomEvent<number>
}>
```

### Add event listeners

[Documentation](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

```ts
myEventTarget.on("my-event", onMyEvent)
myEventTarget.addEventListener("my-event", onMyEvent)

function onMyEvent(event: MyEvent) {
	// ...
}
```

> [!NOTE]
> Just like it is the case with `EventTarget`, an attempt to add the same event listener twice will be ignored without throwing an error.

#### Once

_Once_ event listeners are listeners that are only invoked once and then removed.

[Documentation](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#once)

```ts
myEventTarget.once("my-event", onMyEvent)
myEventTarget.addEventListener("my-event", onMyEvent, { once: true })
```

### Dispatch events

[Documentation](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

```ts
myEventTarget.emit(new MyEvent())
myEventTarget.dispatchEvent(new MyEvent())
```

### Remove event listeners

[Documentation](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

```ts
myEventTarget.off("my-event", onMyEvent)
myEventTarget.removeEventListener("my-event", onMyEvent)
```

### Remove all event listeners <sup>✨</sup>

You can remove all event listeners for a specific event type.

```ts
myEventTarget.clear("my-event")
```

### Event listener map <sup>✨</sup>

A `Map` of event types to event listeners is available via `eventListeners`:

```ts
myEventTarget.eventListeners
// Map<keyof MyEventMap | "*", EventListener[]>
```

> [!NOTE]
> This map only contains active event listeners. Event types are removed once their last event listener is removed. Wildcard event listeners, if present, are also included in this map with an event type of `"*"`.

### Mute events <sup>✨</sup>

You can mute all events of a certain type, allowing you to prevent all event listeners from invoking until you unmute.

```ts
// Mute. 🔇
myEventTarget.mute("my-event")

// Ignored. 🙈
myEventTarget.emit(new MyEvent())

// Unmute. 🔊
myEventTarget.unmute("my-event")
```

A `Set` of all muted event types is available via `mutedEventTypes`:

```ts
myEventTarget.mutedEventTypes
// Set<keyof MyEventMap>
```

### Wildcard event type <sup>✨</sup>

With the optional wildcard event type (`"*"`) you can reference all event types at once. This is supported by all **jaset** methods, except `emit()` and `dispatchEvent()`.

```ts
myEventTarget.on("*", onAnyEvent)
myEventTarget.off("*", onAnyEvent)
myEventTarget.clear("*")
myEventTarget.mute("*")
myEventTarget.unmute("*")

function onAnyEvent(event: MyEvent | MyOtherEvent) {
	// Eyes on everyone. 👀
}
```

> [!IMPORTANT]
> The wildcard event type is disallowed by default for cleaner IntelliSense suggestions. You can allow it by setting the generic type parameter `AllowWildcardEventType` to `true`.

```ts
import EventTarget from "jaset"

class MyEventTarget extends EventTarget<
	MyEventMap,
	/* AllowWildcardEventType */ true
> {}
```

### Combine event maps <sup>✨</sup>

You can combine multiple event maps when extending the **jaset** event target.

```ts
import EventTarget, { type EventMap } from "jaset"

class MyEventTarget<
	MyEventMap extends EventMap<MyEventMap>,
> extends EventTarget<BaseEventMap & MyEventMap> {}

type BaseEventMap = EventMap<{
	"my-event": MyEvent
}>

class MyEventTargetExtension extends MyEventTarget<ExtensionEventMap> {}

type ExtensionEventMap = EventMap<{
	"my-other-event": MyOtherEvent
}>

const myEventTarget = new MyEventTargetExtension()

myEventTarget.on("my-event", () => {}) // ✅
myEventTarget.on("my-other-event", () => {}) // ✅
myEventTarget.on("foo", () => {}) // ⛔️
```

Combining event maps can be useful when designing an interface where clients should be able to extend the base event map you define.

You can prevent clients from being able to override entries from the base event map by utilizing [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys):

```ts
class MyEventTarget<
	MyEventMap extends Omit<EventMap<MyEventMap>, keyof BaseEventMap>,
> extends EventTarget<BaseEventMap & MyEventMap> {}
```

## Package exports

The **jaset** package exports the following:

- **Event target class**

    ```ts
    import EventTarget from "jaset"
    // or
    import { EventTarget } from "jaset"
    ```

- **Map of event types to events** (type only)

    ```ts
    import type { EventMap } from "jaset"
    ```

    Used for defining custom event maps.

    ```ts
    type MyEventMap = EventMap<{
    	"my-event": MyEvent
    }>
    ```

    When the type parameter of `EventMap` is omitted, the event map becomes `Record<string, Event>`.
