import moment, { type Duration } from "moment";

/**
 * Container type for data which can expose functions for retrieving, comparing, and rendering the data.
 * Most commonly used in conjunction with formulas for Bases. Values can be used as formula parameters,
 * intermediate values, and the result of evaluation.
 * @public
 * @since 1.10.0
 */
export abstract class Value {
	/**
	 * @public
	 * @since 1.10.0
	 */
	static readonly type: string = "value";

	/**
	 * @public
	 * @since 1.10.0
	 */
	static equals(a: Value | null, b: Value | null): boolean {
		if (a === null || a instanceof NullValue) {
			return b === null || b instanceof NullValue;
		}
		if (b === null || b instanceof NullValue) {
			return false;
		}
		return a.equals(b);
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	static looseEquals(a: Value | null, b: Value | null): boolean {
		if (a === null || a instanceof NullValue) {
			return b === null || b instanceof NullValue;
		}
		if (b === null || b instanceof NullValue) {
			return false;
		}
		return a.looseEquals(b);
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	abstract toString(): string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	abstract isTruthy(): boolean;

	/**
	 * @public
	 * @since 1.10.0
	 */
	equals(other: Value): boolean {
		return this.constructor === other.constructor && this.toString() === other.toString();
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	looseEquals(other: Value): boolean {
		return this.equals(other);
	}

	/**
	 * Render this value into the provided HTMLElement.
	 * @public
	 * @since 1.10.0
	 */
	renderTo(el: HTMLElement, ctx: unknown): void {
		el.appendChild(el.ownerDocument.createTextNode(this.toString()));
	}
}

/**
 * Base type for all non-null {@link Values}.
 * @public
 * @since 1.10.0
 */
export abstract class NotNullValue extends Value {}

/**
 * Base type for {@link Values} which wrap a single primitive.
 * @public
 * @since 1.10.0
 */
export abstract class PrimitiveValue<T> extends NotNullValue {
	/** The wrapped primitive. */
	readonly value: T;

	/**
	 * @public
	 * @since 1.10.0
	 */
	constructor(value: T) {
		super();
		this.value = value;
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		return String(this.value);
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		return Boolean(this.value);
	}

	/**
	 * Compare wrapped primitives without coercion.
	 *
	 * @param other Value to compare.
	 * @returns Whether the types and wrapped primitives match.
	 */
	equals(other: Value): boolean {
		return (
			this.constructor === other.constructor && other instanceof PrimitiveValue && Object.is(this.value, other.value)
		);
	}
}

/**
 * {@link Value} which represents null.
 * NullValue is a singleton and `NullValue.value` should be used instead of calling the constructor.
 * @public
 * @since 1.10.0
 */
export class NullValue extends Value {
	/**
	 * @public
	 * @since 1.10.0
	 */
	static readonly value = new NullValue();

	private constructor() {
		super();
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		return "";
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		return false;
	}
}

/**
 * {@link Value} wrapping a boolean.
 * @public
 * @since 1.10.0
 */
export class BooleanValue extends PrimitiveValue<boolean> {
	/**
	 * @public
	 * @since 1.10.0
	 */
	static readonly type = "boolean";
}

/**
 * {@link Value} wrapping a number.
 * @public
 * @since 1.10.0
 */
export class NumberValue extends PrimitiveValue<number> {
	/**
	 * @public
	 * @since 1.10.0
	 */
	static readonly type = "number";
}

/**
 * {@link Value} wrapping an object.
 * @public
 * @since 1.10.0
 */
export class ObjectValue extends NotNullValue {
	/**
	 * @public
	 * @since 1.10.0
	 */
	static readonly type = "object";
	private readonly value: Record<string, unknown>;

	/**
	 * Create an object value.
	 *
	 * @param value Object to wrap.
	 */
	constructor(value: Record<string, unknown> = {}) {
		super();
		this.value = value;
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		return JSON.stringify(this.value);
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		return !this.isEmpty();
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isEmpty(): boolean {
		return Object.keys(this.value).length === 0;
	}

	/**
	 * @returns the {@link Value} associated with the provided key, or {@link NullValue}.
	 * If the referenced property in the object is not a Value, it will be wrapped before returning.
	 * @public
	 * @since 1.10.0
	 */
	get(key: string): Value {
		return Object.hasOwn(this.value, key) ? wrap(this.value[key]) : NullValue.value;
	}

	/**
	 * Compare own properties by value.
	 *
	 * @param other Value to compare.
	 * @returns Whether both objects have the same keys and values.
	 */
	equals(other: Value): boolean {
		if (!(other instanceof ObjectValue)) {
			return false;
		}
		const keys = Object.keys(this.value);
		return (
			keys.length === Object.keys(other.value).length &&
			keys.every((key) => Object.hasOwn(other.value, key) && Value.equals(this.get(key), other.get(key)))
		);
	}
}

/**
 * {@link Value} wrapping a Date.
 * @public
 * @since 1.10.0
 */
export class DateValue extends NotNullValue {
	private readonly timestamp: number;

	/**
	 * Create a date value.
	 *
	 * @param value Valid date, timestamp, or ISO date string.
	 */
	constructor(value: Date | number | string) {
		super();
		const parsed = typeof value === "string" ? moment.parseZone(value, moment.ISO_8601, true) : moment(value);
		if (!parsed.isValid()) {
			throw new TypeError("Invalid date.");
		}
		this.timestamp = parsed.valueOf();
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		return new Date(this.timestamp).toISOString();
	}

	/**
	 * @returns a new DateValue with any time portion in this DateValue removed.
	 * @public
	 * @since 1.10.0
	 */
	dateOnly(): DateValue {
		return new DateValue(moment.utc(this.timestamp).startOf("day").valueOf());
	}

	/**
	 * @returns a new {@link RelativeDateValue} based on this DateValue.
	 * @public
	 * @since 1.10.0
	 */
	relative(): RelativeDateValue {
		return new RelativeDateValue(this.timestamp);
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		return true;
	}

	/**
	 * Create new DateValue from an input string.
	 *
	 * @example
	 * parseFromString("2025-12-31")
	 * parseFromString("2025-12-31T23:59")
	 * parseFromString("2025-12-31T23:59:59")
	 * parseFromString("2025-12-31T23:59:59Z-07")
	 *
	 * @param input - An ISO 8601 date or datetime string.
	 * @public
	 * @since 1.10.0
	 */
	static parseFromString(input: string): DateValue | null {
		const parsed = moment.parseZone(input, moment.ISO_8601, true);
		return parsed.isValid() ? new DateValue(parsed.valueOf()) : null;
	}

	/**
	 * Compare dates by instant.
	 *
	 * @param other Value to compare.
	 * @returns Whether both dates represent the same instant.
	 */
	equals(other: Value): boolean {
		return other instanceof DateValue && this.timestamp === other.timestamp;
	}

	/** @returns The timestamp in milliseconds since the Unix epoch. */
	getTime(): number {
		return this.timestamp;
	}
}

/**
 * {@link Value} wrapping a duration. Durations can be used to modify a {@link DateValue} or can
 * result from subtracting a DateValue from another.
 * @public
 * @since 1.10.0
 */
export class DurationValue extends NotNullValue {
	private readonly duration: Duration;

	private constructor(duration: Duration) {
		super();
		this.duration = duration.clone();
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		return this.duration.toISOString();
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		return this.duration.asMilliseconds() !== 0;
	}

	/**
	 * Modifies the provided {@DateValue} by this duration.
	 * @public
	 * @since 1.10.0
	 */
	addToDate(value: DateValue, subtract = false): DateValue {
		const date = moment.utc(value.getTime());
		return new DateValue((subtract ? date.subtract(this.duration) : date.add(this.duration)).valueOf());
	}

	/**
	 * Convert this duration into milliseconds.
	 * @public
	 * @since 1.10.0
	 */
	getMilliseconds(): number {
		return this.duration.asMilliseconds();
	}

	/**
	 * Create a new DurationValue using an ISO 8601 duration.
	 * See {@link https://en.wikipedia.org/wiki/ISO_8601#Durations} for duration format details.
	 * @public
	 * @since 1.10.0
	 */
	static parseFromString(input: string): DurationValue | null {
		if (
			!/^[+-]?P(?=\d|T\d)(?:\d+(?:[.,]\d+)?Y)?(?:\d+(?:[.,]\d+)?M)?(?:\d+(?:[.,]\d+)?W)?(?:\d+(?:[.,]\d+)?D)?(?:T(?=\d)(?:\d+(?:[.,]\d+)?H)?(?:\d+(?:[.,]\d+)?M)?(?:\d+(?:[.,]\d+)?S)?)?$/.test(
				input,
			)
		) {
			return null;
		}
		const duration = moment.duration(input);
		return duration.isValid() ? new DurationValue(duration) : null;
	}

	/**
	 * Create a new DurationValue from milliseconds.
	 * @public
	 * @since 1.10.0
	 */
	static fromMilliseconds(milliseconds: number): DurationValue {
		if (!Number.isFinite(milliseconds)) {
			throw new TypeError("Duration must be finite.");
		}
		return new DurationValue(moment.duration(milliseconds));
	}
}

/**
 * {@link Value} wrapping a file in Obsidian.
 * @public
 * @since 1.10.0
 */
export class FileValue extends NotNullValue {
	private readonly path: string;

	/**
	 * Create a file value.
	 *
	 * @param file File with a vault-relative path.
	 */
	constructor(file: { path: string }) {
		super();
		this.path = file.path;
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		return this.path;
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		return true;
	}
}

/**
 * {@link Value} wrapping an array of Values. Values do not all need to be of the same type.
 * @public
 * @since 1.10.0
 */
export class ListValue extends NotNullValue {
	/**
	 * @public
	 * @since 1.10.0
	 */
	static readonly type = "list";
	private readonly value: Value[];

	/**
	 * The array passed in will be modified!
	 * @param value - Contents of the list.
	 * @public
	 * @since 1.10.0
	 */
	constructor(value: unknown[]) {
		super();
		this.value = value.map((item) => wrap(item));
		for (let i = 0; i < this.value.length; i++) {
			value[i] = this.value[i];
		}
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		return this.value.map((item) => item.toString()).join(", ");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		return this.value.length > 0;
	}

	/**
	 * @returns true if any elements in this list loosely equal the provided value.
	 * @public
	 * @since 1.10.0
	 */
	includes(value: Value): boolean {
		return this.value.some((item) => item.looseEquals(value));
	}

	/**
	 * @returns the number of elements in this list.
	 * @public
	 * @since 1.10.0
	 */
	length(): number {
		return this.value.length;
	}

	/**
	 * @returns the value at the provided index, or {@link NullValue}.
	 * @public
	 * @since 1.10.0
	 */
	get(index: number): Value {
		return this.value[index] ?? NullValue.value;
	}

	/**
	 * @returns a new {@link ListValue} containing the elements from this ListValue and the provided ListValue.
	 * @public
	 * @since 1.10.0
	 */
	concat(other: ListValue): ListValue {
		return new ListValue([...this.value, ...other.value]);
	}

	/**
	 * Compare lists element by element.
	 *
	 * @param other Value to compare.
	 * @returns Whether both lists have equal elements.
	 */
	equals(other: Value): boolean {
		return (
			other instanceof ListValue &&
			this.value.length === other.value.length &&
			this.value.every((value, index) => Value.equals(value, other.value[index] ?? null))
		);
	}
}

/**
 * {@link Value} wrapping a RegExp pattern.
 * @public
 * @since 1.10.0
 */
export class RegExpValue extends NotNullValue {
	private readonly value: RegExp;

	/**
	 * Create a regular expression value.
	 *
	 * @param value Regular expression to wrap.
	 */
	constructor(value: RegExp) {
		super();
		this.value = value;
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		return this.value.toString();
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		return true;
	}
}

/**
 * {@link Value} wrapping a Date.
 * RelativeDateValue behaves the same as a {@link DateValue} however it renders as a time relative to now.
 * @public
 * @since 1.10.0
 */
export class RelativeDateValue extends DateValue {
	/** @returns A relative description of this date. */
	toString(): string {
		return moment.utc(super.toString()).fromNow();
	}
}

/**
 * {@link Value} wrapping a string.
 * @public
 * @since 1.10.0
 */
export class StringValue extends PrimitiveValue<string> {
	/**
	 * @public
	 * @since 1.10.0
	 */
	static readonly type = "string";
}

/**
 * {@link Value} wrapping raw HTML.
 * @public
 * @since 1.10.0
 */
export class HTMLValue extends StringValue {}

/**
 * {@link Value} wrapping a renderable icon.
 * @public
 * @since 1.10.0
 */
export class IconValue extends StringValue {}

/**
 * {@link Value} wrapping a path to an image resource in the vault.
 * @public
 * @since 1.10.0
 */
export class ImageValue extends StringValue {}

/**
 * {@link Value} wrapping an internal wikilink.
 * @public
 * @since 1.10.0
 */
export class LinkValue extends StringValue {
	/**
	 * Create a new LinkValue from wikilink syntax.
	 *
	 * @param app Application context.
	 * @param input Wikilink text.
	 * @param sourcePath Path of the source file.
	 * @returns The parsed link value, or null.
	 * @example
	 * parseFromString("[[Welcome|Example Link]]")
	 *
	 * @public
	 * @since 1.10.0
	 */
	static parseFromString(app: unknown, input: string, sourcePath: string): LinkValue | null {
		throw new Error("Method not implemented.");
	}
}

/**
 * {@link Value} wrapping an external link.
 * @public
 * @since 1.10.0
 */
export class UrlValue extends StringValue {}

/**
 * {@link Value} wrapping an Obsidian tag.
 * @public
 * @since 1.10.0
 */
export class TagValue extends StringValue {
	/**
	 * @public
	 * @since 1.10.0
	 */
	constructor(value: string) {
		super(value);
	}
}

function wrap(value: unknown): Value {
	if (value instanceof Value) {
		return value;
	}
	if (value === null || value === undefined) {
		return NullValue.value;
	}
	if (typeof value === "string") {
		return new StringValue(value);
	}
	if (typeof value === "number") {
		return new NumberValue(value);
	}
	if (typeof value === "boolean") {
		return new BooleanValue(value);
	}
	if (value instanceof Date) {
		return new DateValue(value);
	}
	if (value instanceof RegExp) {
		return new RegExpValue(value);
	}
	if (Array.isArray(value)) {
		return new ListValue(value);
	}
	if (typeof value === "object") {
		return new ObjectValue(value as Record<string, unknown>);
	}
	throw new TypeError(`Unsupported value type: ${typeof value}.`);
}
