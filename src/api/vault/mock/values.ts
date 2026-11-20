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
	static type: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	static equals(a: Value | null, b: Value | null): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	static looseEquals(a: Value | null, b: Value | null): boolean {
		throw new Error("Method not implemented.");
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
	equals(other: this): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	looseEquals(other: Value): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * Render this value into the provided HTMLElement.
	 * @public
	 * @since 1.10.0
	 */
	renderTo(el: HTMLElement, ctx: RenderContext): void {
		throw new Error("Method not implemented.");
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
	/**
	 * @public
	 * @since 1.10.0
	 */
	constructor(value: T) {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		throw new Error("Method not implemented.");
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
	toString(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	static value: NullValue;
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
	static type: string;
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
	static type: string;
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
	static type: string;

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isEmpty(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * @returns the {@link Value} associated with the provided key, or {@link NullValue}.
	 * If the referenced property in the object is not a Value, it will be wrapped before returning.
	 * @public
	 * @since 1.10.0
	 */
	get(key: string): Value | null {
		throw new Error("Method not implemented.");
	}
}

/**
 * {@link Value} wrapping a Date.
 * @public
 * @since 1.10.0
 */
export class DateValue extends NotNullValue {
	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @returns a new DateValue with any time portion in this DateValue removed.
	 * @public
	 * @since 1.10.0
	 */
	dateOnly(): DateValue {
		throw new Error("Method not implemented.");
	}

	/**
	 * @returns a new {@link RelativeDateValue} based on this DateValue.
	 * @public
	 * @since 1.10.0
	 */
	relative(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
	}
}

/**
 * {@link Value} wrapping a duration. Durations can be used to modify a {@link DateValue} or can
 * result from subtracting a DateValue from another.
 * @public
 * @since 1.10.0
 */
export class DurationValue extends NotNullValue {
	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * Modifies the provided {@DateValue} by this duration.
	 * @public
	 * @since 1.10.0
	 */
	addToDate(value: DateValue, subtract?: boolean): DateValue {
		throw new Error("Method not implemented.");
	}

	/**
	 * Convert this duration into milliseconds.
	 * @public
	 * @since 1.10.0
	 */
	getMilliseconds(): number {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a new DurationValue using an ISO 8601 duration.
	 * See {@link https://en.wikipedia.org/wiki/ISO_8601#Durations} for duration format details.
	 * @public
	 * @since 1.10.0
	 */
	static parseFromString(input: string): DurationValue | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a new DurationValue from milliseconds.
	 * @public
	 * @since 1.10.0
	 */
	static fromMilliseconds(milliseconds: number): DurationValue {
		throw new Error("Method not implemented.");
	}
}

/**
 * {@link Value} wrapping a file in Obsidian.
 * @public
 * @since 1.10.0
 */
export class FileValue extends NotNullValue {
	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		throw new Error("Method not implemented.");
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
	static type: string;

	/**
	 * The array passed in will be modified!
	 * @param value - Contents of the list.
	 * @public
	 * @since 1.10.0
	 */
	constructor(value: (unknown | Value)[]) {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * @returns true if any elements in this list loosely equal the provided value.
	 * @public
	 * @since 1.10.0
	 */
	includes(value: Value): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * @returns the number of elements in this list.
	 * @public
	 * @since 1.10.0
	 */
	length(): number {
		throw new Error("Method not implemented.");
	}

	/**
	 * @returns the value at the provided index, or {@link NullValue}.
	 * @public
	 * @since 1.10.0
	 */
	get(index: number): Value {
		throw new Error("Method not implemented.");
	}

	/**
	 * @returns a new {@link ListValue} containing the elements from this ListValue and the provided ListValue.
	 * @public
	 * @since 1.10.0
	 */
	concat(other: ListValue): ListValue {
		throw new Error("Method not implemented.");
	}
}

/**
 * {@link Value} wrapping a RegExp pattern.
 * @public
 * @since 1.10.0
 */
export class RegExpValue extends NotNullValue {
	/**
	 * @public
	 * @since 1.10.0
	 */
	toString(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @public
	 * @since 1.10.0
	 */
	isTruthy(): boolean {
		throw new Error("Method not implemented.");
	}
}

/**
 * {@link Value} wrapping a Date.
 * RelativeDateValue behaves the same as a {@link DateValue} however it renders as a time relative to now.
 * @public
 * @since 1.10.0
 */
export class RelativeDateValue extends DateValue {}

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
	static type: string;
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
		throw new Error("Method not implemented.");
	}
}
