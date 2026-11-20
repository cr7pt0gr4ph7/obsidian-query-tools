import type { BasesProperty, BasesPropertyId } from "./bases/properties.js";

/**
 * Split a Bases property ID into constituent parts.
 * @public
 * @since 1.10.0
 */
export function parsePropertyId(propertyId: BasesPropertyId): BasesProperty;
