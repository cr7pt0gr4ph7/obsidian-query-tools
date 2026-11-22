/**
 * Abstract constructor type.
 * @public
 */
export type Constructor<T> = abstract new (...args: any[]) => T;
