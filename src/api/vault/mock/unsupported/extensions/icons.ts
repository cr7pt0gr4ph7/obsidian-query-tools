/**
 * Can be any Lucide icon name or an internal icon name.
 * @public
 */
export type IconName = string;

/**
 * Adds an icon to the library.
 * @param iconId the icon ID.
 * @param svgContent the content of the SVG.
 * @example
 * ```ts
 * addIcon('my-icon', '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>');
 * ```
 * @public
 */
export function addIcon(iconId: string, svgContent: string): void {
    throw new Error("Method not implemented.");
}

/**
 * Create an SVG from an iconId. Returns `null` if no icon associated with the iconId.
 * @param iconId the icon ID.
 * @public
 */
export function getIcon(iconId: string): SVGSVGElement | null {
    throw new Error("Method not implemented.");
}

/**
 * Get the list of registered icons.
 * @public
 */
export function getIconIds(): IconName[] {
    throw new Error("Method not implemented.");
}

/**
 * Insert an SVG into the element from an iconId. Does nothing if no icon associated with the iconId.
 * @param parent the element.
 * @param iconId the icon ID.
 * @see The Obsidian icon library includes the {@link https://lucide.dev/ Lucide icon library}, any icon name from their site will work here.
 * @public
 */
export function setIcon(parent: HTMLElement, iconId: IconName): void {
    throw new Error("Method not implemented.");
}
