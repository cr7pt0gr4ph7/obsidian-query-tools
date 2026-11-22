/**
 * @public
 */
export interface HistoryHandler {
	/** @public */
	onHistoryBack(): void;

	/** @public */
	onHistoryForward?(): void;
}
