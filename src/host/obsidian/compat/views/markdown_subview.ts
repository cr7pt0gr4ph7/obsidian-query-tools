
/**
 * A sub view of the Markdown view.
 * @public
 */
export interface MarkdownSubView {
    /**
     * Get the scroll position.
     * @public
     */
    getScroll(): number;

    /**
     * Apply the scroll position.
     * @param scroll The scroll position.
     * @public
     */
    applyScroll(scroll: number): void;

    /**
     * Get the Markdown content.
     * @public
     */
    get(): string;

    /**
     * Set the Markdown content.
     * @param data The content.
     * @param clear Whether to clear first.
     * @public
     */
    set(data: string, clear: boolean): void;
}
