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
 * {@link https://jaset.js.org | Documentation}
 * |
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget | MDN Reference}
 */
export default class Jaset<
	Events extends EventMap,
	AllowWildcardEventType extends boolean = false,
> extends EventTarget {
	/**
	 * A map of event types to event listeners.
	 * @remarks Only contains active event listeners. Event types are removed
	 *  once their last event listener is removed.
	 *
	 *  Wildcard event listeners, if present, are also included in this map with
	 *  an event type of `"*"`.
	 * @readonly
	 */
	get eventListeners(): ReadonlyMap<
		| (keyof Events & string)
		| (AllowWildcardEventType extends true ? Wildcard : never),
		EventListenerOrEventListenerObject<Events[keyof Events & string]>[]
	> {
		const map = new Map<
			| (keyof Events & string)
			| (AllowWildcardEventType extends true ? Wildcard : never),
			EventListenerOrEventListenerObject<Events[keyof Events & string]>[]
		>()

		for (const [type, listeners] of this.#eventListeners) {
			map.set(
				type,
				listeners.map((listener) => listener.callback),
			)
		}

		if (this.#wildcardEventListeners.length > 0) {
			map.set(
				wildcard as never,
				this.#wildcardEventListeners.map(
					(listener) => listener.callback,
				),
			)
		}

		return map
	}

	/**
	 * A set of explicitly muted event types.
	 * @remarks Event listeners for the event types in this set are not invoked
	 *  until {@link Jaset.unmute} is called.
	 *
	 *  Muting all event types via the wildcard (`"*"`) event type, if allowed,
	 *  does not populate this set.
	 * @readonly
	 */
	get mutedEventTypes(): ReadonlySet<keyof Events & string> {
		return this.#mutedEventTypes
	}

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
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | MDN Reference}
	 */
	override addEventListener<K extends EventType<Events>>(
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
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener | MDN Reference}
	 */
	override removeEventListener<K extends EventType<Events>>(
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
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent | MDN Reference}
	 */
	override dispatchEvent(event: Events[EventType<Events>]) {
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
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | MDN Reference}
	 */
	on<K extends EventType<Events>>(
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
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | MDN Reference}
	 */
	once<K extends EventType<Events>>(
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
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener | MDN Reference}
	 */
	off<K extends EventType<Events>>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: EventListenerOptions | boolean,
	) {
		this.#removeEventListener(type, callback, options)
	}

	/**
	 * Removes all event listeners for a type.
	 * @remarks Removes every event listener registered for the given event
	 *  type, regardless of the options they were added with.
	 *
	 *  The wildcard (`"*"`) event type, if allowed, removes all event listeners
	 *  of every type.
	 * @param type - The event type to remove all event listeners for.
	 */
	clear(
		type:
			| EventType<Events>
			| (AllowWildcardEventType extends true ? Wildcard : never),
	) {
		this.#clear(type)
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
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent | MDN Reference}
	 */
	emit(event: Events[EventType<Events>]) {
		return this.#emit(event)
	}

	/**
	 * Mutes events of a type.
	 * @remarks When muted, event listeners for the given event type are not
	 *  invoked until {@link Jaset.unmute} is called.
	 *
	 *  Muting the wildcard (`"*"`) event type, if allowed, mutes all events,
	 *  including those of types that have no listeners yet or are dispatched in
	 *  the future.
	 * @param type - The event type to mute.
	 */
	mute(
		type:
			| EventType<Events>
			| (AllowWildcardEventType extends true ? Wildcard : never),
	) {
		if (type === wildcard) {
			this.#allMuted = true
		} else {
			this.#mutedEventTypes.add(type)
		}
	}

	/**
	 * Unmutes events of a type.
	 * @remarks Reverses the effects of {@link Jaset.mute}.
	 *
	 *  Unmuting the wildcard (`"*"`) event type, if allowed, unmutes all
	 *  events, including individually muted event types.
	 * @param type - The event type to unmute.
	 */
	unmute(
		type:
			| EventType<Events>
			| (AllowWildcardEventType extends true ? Wildcard : never),
	) {
		if (type === wildcard) {
			this.#allMuted = false
			this.#mutedEventTypes.clear()
		} else {
			this.#mutedEventTypes.delete(type)
		}
	}

	readonly #eventListeners = new Map<
		keyof Events & string,
		StoredListener<Events[keyof Events & string]>[]
	>()

	readonly #wildcardEventListeners: StoredWildcardListener<
		Events[keyof Events & string]
	>[] = []

	readonly #mutedEventTypes = new Set<keyof Events & string>()

	#allMuted = false

	readonly #dispatchingWildcardTypes = new Set<string>()

	#addEventListener<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: boolean | AddEventListenerOptions,
	) {
		// `EventTarget` ignores `null` callbacks.
		if (!callback) {
			return
		}

		const capture = normalizeCapture(options)
		const once =
			typeof options === "object" ? (options.once ?? false) : false
		const signal = typeof options === "object" ? options.signal : undefined

		// `EventTarget` never registers a listener for an aborted signal.
		if (signal?.aborted) {
			return
		}

		const callbackToStore = callback as EventListenerOrEventListenerObject<
			Events[keyof Events & string]
		>

		if (type === wildcard) {
			// Prevent duplicate event listeners, just like `EventTarget`.
			if (
				this.#wildcardEventListeners.some(
					(listener) =>
						listener.callback === callbackToStore &&
						listener.capture === capture,
				)
			) {
				return
			}

			const entry: StoredWildcardListener<Events[keyof Events & string]> =
				{ callback: callbackToStore, capture, once }

			this.#registerAbortCleanup(signal, entry, () =>
				this.#removeWildcardListener(callbackToStore, capture),
			)

			this.#wildcardEventListeners.push(entry)

			return
		}

		const typedType = type as keyof Events & string
		const listeners = this.#eventListeners.get(typedType)

		// Prevent duplicate event listeners, just like `EventTarget`.
		if (
			listeners?.some(
				(listener) =>
					listener.callback === callbackToStore &&
					listener.capture === capture,
			)
		) {
			return
		}

		// Muting and the `once` option are handled here, rather than via the
		// native `once` option, so that a muted `once` listener is preserved
		// until it is actually invoked while unmuted, and so that the internal
		// bookkeeping stays in sync when the listener removes itself.
		const nativeListener: EventListenerFn = (event) => {
			if (this.#isMuted(event.type)) {
				return
			}

			invokeListener(
				callbackToStore,
				event as Events[keyof Events & string],
			)

			if (once) {
				this.#removeTypedListener(typedType, callbackToStore, capture)
			}
		}

		super.addEventListener(typedType, nativeListener, {
			capture,
			passive: typeof options === "object" ? options.passive : undefined,
		})

		const entry: StoredListener<Events[keyof Events & string]> = {
			callback: callbackToStore,
			nativeListener,
			capture,
		}

		this.#registerAbortCleanup(signal, entry, () =>
			this.#removeTypedListener(typedType, callbackToStore, capture),
		)

		if (listeners) {
			listeners.push(entry)
		} else {
			this.#eventListeners.set(typedType, [entry])
		}
	}

	#removeEventListener<K extends keyof Events & string>(
		type: K | (AllowWildcardEventType extends true ? Wildcard : never),
		callback: EventListenerOrEventListenerObject<Events[K]> | null,
		options?: EventListenerOptions | boolean,
	) {
		// `EventTarget` ignores `null` callbacks.
		if (!callback) {
			return
		}

		const capture = normalizeCapture(options)
		const callbackToRemove = callback as EventListenerOrEventListenerObject<
			Events[keyof Events & string]
		>

		if (type === wildcard) {
			this.#removeWildcardListener(callbackToRemove, capture)
		} else {
			this.#removeTypedListener(
				type as keyof Events & string,
				callbackToRemove,
				capture,
			)
		}
	}

	#removeTypedListener(
		type: keyof Events & string,
		callback: EventListenerOrEventListenerObject<
			Events[keyof Events & string]
		>,
		capture: boolean,
	) {
		const listeners = this.#eventListeners.get(type)

		if (!listeners) {
			return
		}

		const index = listeners.findIndex(
			(listener) =>
				listener.callback === callback && listener.capture === capture,
		)

		if (index === -1) {
			return
		}

		const [entry] = listeners.splice(index, 1)

		super.removeEventListener(type, entry.nativeListener, {
			capture: entry.capture,
		})
		entry.removeAbortListener?.()

		// Remove the event type if there are no more listeners.
		if (listeners.length === 0) {
			this.#eventListeners.delete(type)
		}
	}

	#removeWildcardListener(
		callback: EventListenerOrEventListenerObject<
			Events[keyof Events & string]
		>,
		capture: boolean,
	) {
		const index = this.#wildcardEventListeners.findIndex(
			(listener) =>
				listener.callback === callback && listener.capture === capture,
		)

		if (index === -1) {
			return
		}

		const [entry] = this.#wildcardEventListeners.splice(index, 1)
		entry.removeAbortListener?.()
	}

	#registerAbortCleanup(
		signal: AbortSignal | undefined,
		entry: { removeAbortListener?: () => void },
		remove: () => void,
	) {
		if (!signal) {
			return
		}

		const onAbort = () => {
			remove()
		}

		signal.addEventListener("abort", onAbort, { once: true })
		entry.removeAbortListener = () => {
			signal.removeEventListener("abort", onAbort)
		}
	}

	#isMuted(type: string) {
		return (
			this.#allMuted ||
			this.#mutedEventTypes.has(type as keyof Events & string)
		)
	}

	#emit(event: Event) {
		const type = event.type
		const registered: {
			nativeListener: EventListenerFn
			capture: boolean
		}[] = []

		// Dispatch wildcard listeners through the native `EventTarget` so that
		// they observe the correct `currentTarget`/`eventPhase` and benefit
		// from the native per-listener error isolation. A type that is already
		// mid-dispatch reuses the listeners registered by the outer dispatch,
		// avoiding duplicate invocations during re-entrant dispatch.
		if (
			this.#wildcardEventListeners.length > 0 &&
			!this.#dispatchingWildcardTypes.has(type)
		) {
			this.#dispatchingWildcardTypes.add(type)

			for (const entry of [...this.#wildcardEventListeners]) {
				const nativeListener: EventListenerFn = (evt) => {
					if (
						!this.#wildcardEventListeners.includes(entry) ||
						this.#isMuted(evt.type)
					) {
						return
					}

					invokeListener(
						entry.callback,
						evt as Events[keyof Events & string],
					)

					if (entry.once) {
						this.#removeWildcardListener(
							entry.callback,
							entry.capture,
						)
					}
				}

				super.addEventListener(type, nativeListener, {
					capture: entry.capture,
				})

				registered.push({ nativeListener, capture: entry.capture })
			}
		}

		try {
			return super.dispatchEvent(event)
		} finally {
			for (const { nativeListener, capture } of registered) {
				super.removeEventListener(type, nativeListener, { capture })
			}

			if (registered.length > 0) {
				this.#dispatchingWildcardTypes.delete(type)
			}
		}
	}

	#clear(
		type:
			| (keyof Events & string)
			| (AllowWildcardEventType extends true ? Wildcard : never),
	) {
		if (type === wildcard) {
			for (const entry of [...this.#wildcardEventListeners]) {
				entry.removeAbortListener?.()
			}
			this.#wildcardEventListeners.length = 0

			for (const knownType of [...this.#eventListeners.keys()]) {
				this.#clearType(knownType)
			}
		} else {
			this.#clearType(type)
		}
	}

	#clearType(type: keyof Events & string) {
		const listeners = this.#eventListeners.get(type)

		if (!listeners) {
			return
		}

		for (const entry of [...listeners]) {
			super.removeEventListener(type, entry.nativeListener, {
				capture: entry.capture,
			})
			entry.removeAbortListener?.()
		}

		this.#eventListeners.delete(type)
	}
}

export { Jaset as EventTarget }

/**
 * A map of event types to events.
 */
export type EventMap<T extends Record<string, Event> = Record<string, Event>> =
	T

type Wildcard = "*"

/**
 * The explicitly declared string event types of an event map.
 * @remarks Excludes index signatures (e.g. those introduced by
 *  `Record<string, Event>`) so that event maps which do not declare specific
 *  event types — including the default {@link EventMap} — do not permit
 *  arbitrary, unsupported event types.
 */
type EventType<Events extends EventMap> = keyof {
	[Key in keyof Events as string extends Key
		? never
		: number extends Key
			? never
			: symbol extends Key
				? never
				: Key]: never
} &
	string

type EventListenerOrEventListenerObject<T extends Event = Event> =
	| EventListenerFn<T>
	| EventListenerObject<T>

// The event parameter is intentionally compared bivariantly (via method
// syntax) so that listeners for a narrower event type remain assignable where
// listeners for a broader event type are expected. This mirrors the variance
// of the DOM's own event listener types and allows subclasses that narrow
// their event map to stay structurally assignable to their base class. That's
// why we use a bivariance hack here by defining the function type via an object
// property (`jaset`) rather than directly as a function type, which would be
// contravariant in the event parameter.
type EventListenerFn<T extends Event = Event> = {
	jaset(event: T): void
}["jaset"]

interface EventListenerObject<T extends Event = Event> {
	handleEvent(event: T): void
}

type StoredListener<E extends Event = Event> = {
	callback: EventListenerOrEventListenerObject<E>
	nativeListener: EventListenerFn
	capture: boolean
	removeAbortListener?: () => void
}

type StoredWildcardListener<E extends Event = Event> = {
	callback: EventListenerOrEventListenerObject<E>
	capture: boolean
	once: boolean
	removeAbortListener?: () => void
}

const wildcard: Wildcard = "*"

function normalizeCapture(options?: boolean | EventListenerOptions): boolean {
	return typeof options === "boolean" ? options : (options?.capture ?? false)
}

function invokeListener<E extends Event>(
	callback: EventListenerOrEventListenerObject<E>,
	event: E,
) {
	if (typeof callback === "function") {
		callback(event)
	} else {
		callback.handleEvent(event)
	}
}
