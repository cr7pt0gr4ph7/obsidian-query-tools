/**
 * Hex strings are 6-digit hash-prefixed rgb strings in lowercase form.
 * @example
 * ```ts
 * const hexString: HexString = '#ffffff';
 * ```
 * @public
 */
export type HexString = string;

/**
 * Represents an HSL color.
 * @public
 * @since 0.16.0
 */
export interface HSL {
	/**
	 * Hue integer value between 0 and 360.
	 * @public
	 * @since 0.16.0
	 */
	h: number;

	/**
	 * Saturation integer value between 0 and 100.
	 * @public
	 * @since 0.16.0
	 */
	s: number;

	/**
	 * Lightness integer value between 0 and 100.
	 * @public
	 * @since 0.16.0
	 */
	l: number;
}

/**
 * A color in RGB format.
 * @public
 * @since 0.16.0
 */
export interface RGB {
	/**
	 * Red integer value between 0 and 255.
	 * @public
	 */
	r: number;

	/**
	 * Green integer value between 0 and 255.
	 * @public
	 */
	g: number;

	/**
	 * Blue integer value between 0 and 255.
	 * @public
	 */
	b: number;
}
