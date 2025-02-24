/**
 * **jaset**
 *
 * A simple, type-safe implementation of `EventTarget` with zero
 * dependencies and select enhancements for a better developer experience.
 * @packageDocumentation
 */

/**
 * **jaset** — Just a strict event target.
 *
 * An object that can receive events and may have listeners for them.
 *
 * @typeParam Events - A map of event types to events.
 * @typeParam AllowWildcardEventType - Whether to allow the use of the wildcard
 *  (`"*"`) event type. Defaults to `false`.
 *
 * {@link [Documentation](https://jaset.js.org)}
 * |
 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)}
 */
export default class Jaset<
	Events extends EventMap<Events>,
	AllowWildcardEventType extends boolean = false,
> extends EventTarget {
	/**
	 * A map of event types to event listeners.
	 * @remarks Only contains active event listeners. Event types are removed
	 *  once their last event listener is removed. Wildcard event listeners, if
	 *  present, are also included in this map with an event type of `"*"`.
	 * @readonly
	 */
	get eventListeners() {
		const map = new Map<
			| (keyof Events & string)
			| (AllowWildcardEventType extends true ? Wildcard : never),
			EventListener[]
		>()

		for (const [type, listeners] of this.#eventListeners.entries()) {
			map.set(
				type,
				listeners.map(({ callback }) => callback as EventListener),
			)
		}

		const wildcardEventListeners = Array.from(
			this.#wildcardEventListeners.values(),
		)

		if (wildcardEventListeners.length > 0) {
			map.set(
				wildcard as never,
				wildcardEventListeners as EventListener[],
			)
		}

		return map
	}

	/**
	 * A set of muted event types.
	 * @remarks Event listeners for the even types in this set are not invoked
	 *  until {@link Jaset.unmute} is called.
	 * @readonly
	 */
	readonly mutedEventTypes: Set<keyof Events & string> = new Set()

	/**
	 * Appends an event listener for events with the specified event type. The
	 * `callback` argument sets the callback that will be invoked when the event
	 * is dispatched.
	 *
	 * @param type - The event type to listen for.
	 * @param callback - The event listener function that is invoked when an
	 *  event of the specified type occurs.
	 * @param options - An options object that specifies characteristics about
	 *  the event listener.
	 *
	 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)}
	 */
	override addEventListener<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: boolean | AddEventListenerOptions,
	) {
		this.#addEventListener(type, callback, options)
	}

	/**
	 * Removes an event listener.
	 *
	 * @param type - The event listener's event type.
	 * @param callback - The event listener's callback function.
	 * @param options - The event listener's options object.
	 *
	 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)}
	 */
	override removeEventListener<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: EventListenerOptions | boolean,
	) {
		this.#removeEventListener(type, callback, options)
	}

	/**
	 * Dispatches an event.
	 *
	 * @param event - The event to dispatch.
	 * @returns `true` if either the event's `cancelable`
	 *  attribute value is `false` or its `preventDefault()` method was not
	 *  invoked, and `false` otherwise.
	 *
	 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)}
	 */
	override dispatchEvent(event: EventMap[keyof Events & string]) {
		return this.#emit(event)
	}

	/**
	 * Appends an event listener for events with the specified event type. The
	 * `callback` argument sets the callback that will be invoked when the event
	 * is dispatched.
	 *
	 * *Alias for {@link Jaset.addEventListener}.*
	 *
	 * @param type - The event type to listen for.
	 * @param callback - The event listener function that is invoked when an
	 *  event of the specified type occurs.
	 * @param options - An options object that specifies characteristics about
	 *  the event listener.
	 *
	 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)}
	 */
	on<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: boolean | AddEventListenerOptions,
	) {
		this.#addEventListener(type, callback, options)
	}

	/**
	 * Appends an event listener for events with the specified event type. The
	 * `callback` argument sets the callback that will be invoked when the event
	 * is dispatched. The event listener is removed after being invoked.
	 *
	 * *Alias for {@link Jaset.addEventListener} with the `once`
	 * option set to `true`.*
	 *
	 * @param type - The event type to listen for.
	 * @param callback - The event listener function that is invoked once when
	 *  an event of the specified type occurs.
	 * @param options - An options object that specifies characteristics about
	 *  the event listener.
	 *
	 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)}
	 */
	once<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: boolean | Omit<AddEventListenerOptions, "once">,
	) {
		this.#addEventListener(type, callback, {
			...(typeof options === "boolean" ? { capture: options } : options),
			once: true,
		})
	}

	/**
	 * Removes an event listener.
	 *
	 * *Alias for {@link Jaset.removeEventListener}.*
	 *
	 * @param type - The event listener's event type.
	 * @param callback - The event listener's callback function.
	 * @param options - The event listener's options object.
	 *
	 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)}
	 */
	off<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: EventListenerOptions | boolean,
	) {
		this.#removeEventListener(type, callback, options)
	}

	/**
	 * Removes all event listeners.
	 * @param type - The event type to remove all event listeners for.
	 * @param options - The options object for all event listeners.
	 */
	clear(
		type:
			| (keyof Events & string)
			| (AllowWildcardEventType extends true ? Wildcard : never),
		options?: EventListenerOptions | boolean,
	) {
		this.#clear(type, options)
	}

	/**
	 * Dispatches an event.
	 *
	 * *Alias for {@link Jaset.dispatchEvent}.*
	 *
	 * @param event - The event to dispatch.
	 * @returns `true` if either the event's `cancelable`
	 *  attribute value is `false` or its `preventDefault()` method was not
	 *  invoked, and `false` otherwise.
	 *
	 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)}
	 */
	emit(event: EventMap[keyof Events & string]) {
		return this.#emit(event)
	}

	/**
	 * Mutes events of a type.
	 * @remarks When muted, event listeners for the given event type are not
	 *  invoked until {@link Jaset.unmute} is called.
	 * @param type - The event type to mute.
	 */
	mute(
		type:
			| (keyof Events & string)
			| (AllowWildcardEventType extends true ? Wildcard : never),
	) {
		if (type === wildcard) {
			for (const type of Array.from(this.#eventListeners.keys())) {
				this.mutedEventTypes.add(type)
			}
		} else {
			this.mutedEventTypes.add(type)
		}
	}

	/**
	 * Unmutes events of a type.
	 * @remarks Reverses the effects of {@link Jaset.mute}.
	 * @param type - The event type to unmute.
	 */
	unmute(
		type:
			| (keyof Events & string)
			| (AllowWildcardEventType extends true ? Wildcard : never),
	) {
		if (type === wildcard) {
			for (const type of Array.from(this.#eventListeners.keys())) {
				this.mutedEventTypes.delete(type)
			}
		} else {
			this.mutedEventTypes.delete(type)
		}
	}

	readonly #eventListeners: Map<
		keyof Events & string,
		{
			callback: EventListenerOrEventListenerObject<
				Events[keyof Events & string]
			> | null
			listener: EventListener
		}[]
	> = new Map()

	readonly #wildcardEventListeners: Set<EventListenerOrEventListenerObject<
		Events[keyof Events & string]
	> | null> = new Set()

	#addEventListener<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: boolean | AddEventListenerOptions,
	) {
		if (type === wildcard) {
			if (this.#wildcardEventListeners.has(callback as never)) {
				return
			}

			this.#wildcardEventListeners.add(callback as never)

			return
		}

		// Prevent duplicate event listeners, just like `EventTarget`.
		if (
			this.#eventListeners
				.get(type as never)
				?.some((listener) => listener.callback === callback)
		) {
			return
		}

		let listener: EventListener = (evt) => {
			if (!this.mutedEventTypes.has(evt.type as never)) {
				if (typeof callback === "function") {
					callback(evt as never)
				} else if (callback?.handleEvent) {
					callback.handleEvent(evt as never)
				}
			}
		}

		if (typeof options === "object" && options.once) {
			const listener_ = listener

			listener = (evt) => {
				if (this.mutedEventTypes.has(evt.type as never)) {
					super.addEventListener(evt.type, listener, options)
				} else {
					listener_(evt)
					this.#removeEventListener(
						evt.type as never,
						listener,
						options,
					)
				}
			}
		}

		super.addEventListener(type, listener, options)

		if (!this.#eventListeners.has(type as never)) {
			this.#eventListeners.set(type as never, [
				{ callback: callback as never, listener },
			])
		} else {
			this.#eventListeners
				.get(type as never)
				?.push({ callback: callback as never, listener })
		}
	}

	#removeEventListener<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: EventListenerOptions | boolean,
	) {
		if (type === wildcard) {
			this.#wildcardEventListeners.delete(callback as never)

			return
		}

		const listener = this.#eventListeners
			.get(type as never)
			?.find((listener) => listener.callback === callback)

		if (!listener) {
			return
		}

		super.removeEventListener(type as string, listener.listener, options)

		this.#eventListeners.set(
			type as never,
			this.#eventListeners
				.get(type as never)
				?.filter((listener) => listener.callback !== callback) || [],
		)

		// Remove the event type if there are no more listeners.
		if (this.#eventListeners.get(type as never)?.length === 0) {
			this.#eventListeners.delete(type as never)
			this.mutedEventTypes.delete(type as never)
		}
	}

	#emit(event: EventMap[keyof Events & string]) {
		const value = super.dispatchEvent(event)

		// Trigger wildcard event listeners.
		for (const listener of this.#wildcardEventListeners) {
			if (!this.mutedEventTypes.has(event.type as never)) {
				if (typeof listener === "function") {
					listener(event as never)
				} else if (listener?.handleEvent) {
					listener.handleEvent(event as never)
				}
			}
		}

		return value
	}

	#clear(
		type:
			| (keyof Events & string)
			| (AllowWildcardEventType extends true ? Wildcard : never),
		options?: EventListenerOptions | boolean,
	) {
		if (type === wildcard) {
			this.#wildcardEventListeners.clear()

			for (const type of Array.from(this.#eventListeners.keys())) {
				// Calling this function recursively is safe here, as the event
				// type read from `this.#eventListeners` can never be a
				// wildcard.
				this.#clear(type, options)
			}
		} else {
			const listeners = this.#eventListeners.get(type)

			if (!listeners) {
				return
			}

			// `Array.from(listeners)` is used to ensure all listeners are
			// iterated over, even if they are removed during the iteration, due
			// to `listeners` being a reference.
			for (const listener of Array.from(listeners)) {
				this.#removeEventListener(type, listener.callback, options)
			}
		}
	}
}

export { Jaset as EventTarget }

/**
 * A map of event types to events.
 */
export type EventMap<T extends Record<string, Event> = Record<string, Event>> =
	{ [K in keyof T]: T[K] }

type Wildcard = "*"
const wildcard: Wildcard = "*"

type EventListenerOrEventListenerObject<T extends Event = Event> =
	| EventListener<T>
	| EventListenerObject<T>

type EventListener<T extends Event = Event> = (evt: T) => void

interface EventListenerObject<T extends Event = Event> {
	handleEvent(object: T): void
}
