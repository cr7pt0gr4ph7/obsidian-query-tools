/**
 * Where to open a new leaf: in a new tab, a new split, or a new popout window.
 * @public
 */
export type PaneType = 'tab' | 'split' | 'window';

/**
 * The direction to split a leaf in.
 * @public
 */
export type SplitDirection = 'vertical' | 'horizontal';

/**
 * Logical sidedock identity, independent of screen position. In LTR, `'primary'`
 * renders on the left and `'secondary'` on the right; RTL mirrors them.
 * `'left'` and `'right'` are legacy aliases for `'primary'` and `'secondary'`.
 * @public
 */
export type Side = 'primary' | 'secondary' | 'left' | 'right';

/**
 * Abstract constructor type.
 * @public
 */
export type Constructor<T> = abstract new (...args: any[]) => T;
