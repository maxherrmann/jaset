/**
 * **jaset** — Just a strict event target.
 *
 * An object that can receive events and may have listeners for them.
 *
 * {@link [Documentation](https://jaset.js.org)}
 * |
 * {@link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)}
 */
export default class Jaset<
	T extends EventMap<T> = EventMap,
> extends EventTarget {
	/**
	 * A map of event types to event listeners.
	 * @remarks Only contains active event listeners. Event types are removed
	 *  once their last event listener is removed.
	 * @readonly
	 */
	readonly eventListeners: Map<keyof T, EventListener[]> = new Map()

	/**
	 * A set of muted event types.
	 * @remarks Event listeners for the even types in this set are not invoked
	 *  until {@link Jaset.unmute} is called.
	 * @readonly
	 */
	readonly mutedEventTypes: Set<keyof T> = new Set()

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
	override addEventListener<K extends keyof T>(
		type: (K & string) | Wildcard,
		callback: EventListenerOrEventListenerObject<T[K]> | null,
		options?: boolean | AddEventListenerOptions,
	): void {
		if (
			addWildcardListener.bind(this as never)(
				type,
				callback as EventListenerOrEventListenerObject | null,
				options,
			)
		) {
			return
		}

		super.addEventListener(
			type,
			addListener.bind(this as never)(
				type,
				callback as EventListener,
				typeof options !== "boolean" && options?.once,
			),
			options,
		)
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
	override removeEventListener<K extends keyof T>(
		type: (K & string) | Wildcard,
		callback: EventListenerOrEventListenerObject<T[K]> | null,
		options?: EventListenerOptions | boolean,
	): void {
		if (
			removeWildcardListener.bind(this as never)(
				type,
				callback as EventListenerOrEventListenerObject | null,
				options,
			)
		) {
			return
		}

		super.removeEventListener(type, callback as EventListener, options)

		removeListener.bind(this as never)(type, callback as EventListener)
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
	override dispatchEvent(event: T[keyof T & string]): boolean {
		return super.dispatchEvent(event)
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
	on<K extends keyof T>(
		type: K | Wildcard,
		callback: EventListenerOrEventListenerObject<T[K]> | null,
		options?: boolean | AddEventListenerOptions,
	): void {
		if (
			addWildcardListener.bind(this as never)(
				type as string,
				callback as EventListenerOrEventListenerObject | null,
				options,
			)
		) {
			return
		}

		super.addEventListener(
			type as string,
			addListener.bind(this as never)(
				type as string,
				callback as EventListener,
				typeof options !== "boolean" && options?.once,
			),
			options,
		)
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
	once<K extends keyof T>(
		type: K | Wildcard,
		callback: EventListenerOrEventListenerObject<T[K]> | null,
		options?: boolean | Omit<AddEventListenerOptions, "once">,
	): void {
		const options_ = {
			...(typeof options === "boolean" ? { capture: options } : options),
			once: true,
		}

		if (
			addWildcardListener.bind(this as never)(
				type as string,
				callback as EventListenerOrEventListenerObject | null,
				options_,
			)
		) {
			return
		}

		super.addEventListener(
			type as string,
			addListener.bind(this as never)(
				type as string,
				callback as EventListener,
				true,
			),
			options_,
		)
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
	off<K extends keyof T>(
		type: K | Wildcard,
		callback?: EventListenerOrEventListenerObject<T[K]> | null,
		options?: EventListenerOptions | boolean,
	): void {
		if (
			removeWildcardListener.bind(this as never)(
				type as string,
				callback as
					| EventListenerOrEventListenerObject
					| null
					| undefined,
				options,
			)
		) {
			return
		}

		super.removeEventListener(
			type as string,
			callback as EventListener,
			options,
		)

		removeListener.bind(this as never)(
			type as string,
			callback as EventListener,
		)
	}

	/**
	 * Remove all event listeners.
	 * @param type - The event type to remove all event listeners for.
	 * @param options - The event listeners' options object.
	 */
	remove(type: keyof T | Wildcard, options?: EventListenerOptions | boolean) {
		removeAllListeners.bind(this as never)(type as string, options)
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
	emit(event: T[keyof T]): boolean {
		return super.dispatchEvent(event)
	}

	/**
	 * Mutes events of a type.
	 * @remarks When muted, event listeners for the given event type are not
	 *  invoked until {@link Jaset.unmute} is called.
	 * @param type - The event type to mute.
	 */
	mute(type: keyof T | Wildcard) {
		if (type === wildcard) {
			for (const type of Array.from(this.eventListeners.keys())) {
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
	unmute(type: keyof T | Wildcard) {
		if (type === wildcard) {
			for (const type of Array.from(this.eventListeners.keys())) {
				this.mutedEventTypes.delete(type)
			}
		} else {
			this.mutedEventTypes.delete(type)
		}
	}
}

/**
 * A map of event types to events.
 */
export type EventMap<
	T extends Record<Exclude<string, Wildcard>, Event> = Record<string, Event>,
> = Record<keyof T & Exclude<string, Wildcard>, Event>

type Wildcard = "*"
const wildcard: Wildcard = "*"

function addListener(
	this: Jaset,
	type: string,
	callback: EventListener,
	once: boolean = false,
) {
	if (once) {
		callback = (evt) => {
			callback(evt)
			removeListener.bind(this)(type, callback)
		}
	}

	callback = (evt) => {
		if (!this.mutedEventTypes.has(type)) {
			callback(evt)
		}
	}

	if (!this.eventListeners.has(type)) {
		this.eventListeners.set(type, [callback])
	} else {
		this.eventListeners.get(type)?.push(callback)
	}

	return callback
}

function addWildcardListener(
	this: Jaset,
	type: string,
	callback: EventListenerOrEventListenerObject | null,
	options?: boolean | AddEventListenerOptions,
) {
	if (type === wildcard) {
		for (const type of Array.from(this.eventListeners.keys())) {
			this.addEventListener(type as never, callback, options)
		}

		return true
	}

	return false
}

function removeListener(this: Jaset, type: string, callback: EventListener) {
	const listeners = this.eventListeners.get(type)
	const index = listeners?.indexOf(callback)

	if (index !== undefined && index > -1) {
		listeners?.splice(index, 1)

		if (listeners?.length === 0) {
			this.eventListeners.delete(type)
		}
	}
}

function removeWildcardListener(
	this: Jaset,
	type?: string,
	callback?: EventListenerOrEventListenerObject | null,
	options?: EventListenerOptions | boolean,
) {
	if (type === wildcard && callback) {
		for (const type of Array.from(this.eventListeners.keys())) {
			this.removeEventListener(type as never, callback, options)
		}

		return true
	}

	return false
}

function removeAllListeners(
	this: Jaset,
	type: string,
	options?: EventListenerOptions | boolean,
) {
	if (type === wildcard) {
		for (const type of Array.from(this.eventListeners.keys())) {
			for (const callback of this.eventListeners.get(type) ?? []) {
				this.removeEventListener(type as never, callback, options)
			}
		}
	} else {
		for (const callback of this.eventListeners.get(type) ?? []) {
			this.removeEventListener(type as never, callback, options)
		}
	}
}

type EventListenerOrEventListenerObject<T extends Event = Event> =
	| EventListener<T>
	| EventListenerObject<T>

type EventListener<T extends Event = Event> = (evt: T) => void

interface EventListenerObject<T extends Event = Event> {
	handleEvent(object: T): void
}
