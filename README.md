<p align="center">
	<img src="https://max-herrmann.com/deploy/jaset/jaset_logo.png?0" height="75" alt="jaset">
</p>
<p align="center">
    <a href="https://www.npmjs.org/package/jaset">
    	<img src="https://img.shields.io/npm/v/jaset.svg" alt="npm">
    </a>
</p>

**jaset** (_just a strict event target_) is a simple, type-safe implementation of [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) with zero dependencies and select enhancements<sup>✨</sup> for a better developer experience — including short-form method names, event muting, a wildcard event type and more.

## Usage

You can use **jaset** just like you would use `EventTarget` with the addition of providing an `EventMap`.

```ts
import EventTarget, { type EventMap } from "jaset"

class MyEventTarget extends EventTarget<EventMap> {}

interface MyEventMap implements EventMap {
	"my-event": MyEvent
}

const myEventTarget = new MyEventTarget()
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

If you prefer to use [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), just use it in your `EventMap`.

```ts
interface MyEventMap implements EventMap {
	"my-event": CustomEvent<number>
}
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
// Map<keyof MyEventMap, EventListener[]>
```

This map only contains active event listeners. Event types are removed once their last event listener is removed.

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

With the wildcard event type (`"*"`) you can reference all event types at once. This is supported by all **jaset** methods, except `emit` and `dispatchEvent`.

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
