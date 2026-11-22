import type { EventRef } from "../../base/events.js";
import type { TFile } from "../../files/files.js";
import type { HoverParent, HoverPopover } from "../extensions/hover.js";
import type { IconName } from "../icons.js";
import type { View, ViewState } from "../views/view.js";
import { WorkspaceItem } from "./item.js";
import type { WorkspaceMobileDrawer, WorkspaceTabs } from "./parent.js";

/**
 * Options for opening a file in a leaf.
 * @public
 */
export interface OpenViewState {
	/**
	 * The view state.
	 * @public
	 */
	state?: Record<string, unknown>;

	/**
	 * The ephemeral state.
	 * @public
	 */
	eState?: Record<string, unknown>;

	/**
	 * Whether to make the leaf active. Omit to follow the user's preference.
	 * @public
	 */
	active?: boolean;

	/**
	 * A leaf to link this leaf with. See {@link WorkspaceLeaf.setGroupMember}.
	 * @public
	 */
	group?: WorkspaceLeaf;
}

/**
 * A leaf in the workspace, which holds a single view.
 * @public
 */
export class WorkspaceLeaf extends WorkspaceItem implements HoverParent {
	/**
	 * The direct parent of the leaf.
	 *
	 * On desktop, a leaf is always a child of a `WorkspaceTabs` component.
	 * On mobile, a leaf might be a child of a `WorkspaceMobileDrawer`.
	 * Perform an `instanceof` check before making an assumption about the
	 * `parent`.
	 *
	 * @public
	 */
	declare parent: WorkspaceTabs | WorkspaceMobileDrawer;

	/**
	 * The view associated with this leaf. Do not attempt to cast this to your
	 * custom `View` without first checking `instanceof`.
	 * @public
	 */
	declare view: View;

	/**
	 * @inheritDoc
	 * @public
	 */
	declare hoverPopover: HoverPopover | null;

	/**
	 * Open a file in this leaf.
	 * @param file The file.
	 * @param openState Options for opening the file.
	 * @public
	 */
	openFile(file: TFile, openState?: OpenViewState): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Open a view in this leaf.
	 * @param view The view.
	 * @public
	 */
	open(view: View): Promise<View> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the view state of this leaf.
	 * @public
	 */
	getViewState(): ViewState {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the view state of this leaf.
	 * @param viewState The view state.
	 * @param eState The ephemeral state.
	 * @public
	 */
	setViewState(viewState: ViewState, eState?: any): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Returns `true` if this leaf is currently deferred because it is in the background.
	 * A deferred leaf will have a DeferredView as its view, instead of the View that
	 * it should normally have for its type (like MarkdownView for the `markdown` type).
	 * @since 1.7.2
	 * @public
	 */
	get isDeferred(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * If this view is currently deferred, load it and await that it has fully loaded.
	 * @since 1.7.2
	 * @public
	 */
	loadIfDeferred(): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the ephemeral state of this leaf.
	 * @public
	 */
	getEphemeralState(): any {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the ephemeral state of this leaf.
	 * @param state The ephemeral state.
	 * @public
	 */
	setEphemeralState(state: any): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Toggle the pinned state of this leaf.
	 * @public
	 */
	togglePinned(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the pinned state of this leaf.
	 * @param pinned `true` to pin, `false` to unpin.
	 * @public
	 */
	setPinned(pinned: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Link this leaf with another leaf. Reuses `other`'s group, if it exists. When two {@link FileView} instances are linked, they keep their `file` in sync.
	 * Pass `null` to remove this leaf from its group.
	 * @param other The other leaf.
	 * @public
	 */
	setGroupMember(other: WorkspaceLeaf): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the group of this leaf.
	 * @param group The ID of the group, or `null` to remove the leaf from its group.
	 * @public
	 */
	setGroup(group: string): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Close this leaf and remove it from the workspace.
	 * @public
	 */
	detach(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the icon of this leaf.
	 * @public
	 */
	getIcon(): IconName {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the display text of this leaf.
	 * @public
	 */
	getDisplayText(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the leaf is resized.
	 * @public
	 */
	onResize(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Triggered when the pinned state of the leaf changes.
	 * @overload
	 * @public
	 */
	on(name: "pinned-change", callback: (pinned: boolean) => any, ctx?: any): EventRef;

	/**
	 * Triggered when the group of the leaf changes.
	 * @overload
	 * @public
	 */
	on(name: "group-change", callback: (group: string) => any, ctx?: any): EventRef;

	on(name: string, callback: (...data: any[]) => any, ctx?: any): EventRef {
		return super.on(name, callback, ctx);
	}
}
