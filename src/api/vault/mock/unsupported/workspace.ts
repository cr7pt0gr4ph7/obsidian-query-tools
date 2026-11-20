import type { TAbstractFile, TFile } from "../files/files.js";
import type { View, ViewState } from "./view.js";

/**
 * Where to open a new leaf: in a new tab, a new split, or a new popout window.
 * @public
 */
export type PaneType = "tab" | "split" | "window";

/**
 * The direction to split a leaf in.
 * @public
 */
export type SplitDirection = "vertical" | "horizontal";

/**
 * Logical sidedock identity, independent of screen position. In LTR, `'primary'`
 * renders on the left and `'secondary'` on the right; RTL mirrors them.
 * `'left'` and `'right'` are legacy aliases for `'primary'` and `'secondary'`.
 * @public
 */
export type Side = "primary" | "secondary" | "left" | "right";

/**
 * Abstract constructor type.
 * @public
 */
export type Constructor<T> = abstract new (...args: any[]) => T;

/**
 * The workspace, which manages the splits, tab groups, sidedocks, and leaves of the app.
 * @public
 * @since 0.9.7
 */
export class Workspace extends Events {
	/**
	 * The left sidedock.
	 * @public
	 * @since 0.9.7
	 */
	leftSplit: WorkspaceSidedock | WorkspaceMobileDrawer;

	/**
	 * The right sidedock.
	 * @public
	 * @since 0.9.7
	 */
	rightSplit: WorkspaceSidedock | WorkspaceMobileDrawer;

	/**
	 * The left ribbon.
	 * @public
	 * @since 0.9.7
	 */
	leftRibbon: WorkspaceRibbon;

	/**
	 * The right ribbon. No longer exists.
	 * @public
	 * @deprecated No longer used
	 */
	rightRibbon: WorkspaceRibbon;

	/**
	 * The root split, which contains the main area.
	 * @public
	 * @since 0.9.7
	 */
	rootSplit: WorkspaceRoot;

	/**
	 * Indicates the currently focused leaf, if one exists.
	 *
	 * Please avoid using `activeLeaf` directly, especially without checking whether
	 * `activeLeaf` is null.
	 * @public
	 * @deprecated The use of this field is discouraged.
	 * The recommended alternatives are:
	 * - If you need information about the current view, use {@link Workspace.getActiveViewOfType}.
	 * - If you need to open a new file or navigate a view, use {@link Workspace.getLeaf}.
	 * @since 0.9.7
	 */
	activeLeaf: WorkspaceLeaf | null;

	/**
	 * The container element.
	 * @public
	 * @since 0.9.7
	 */
	containerEl: HTMLElement;

	/**
	 * Whether the layout of the app has been successfully initialized.
	 * To react to the layout becoming ready, use {@link Workspace.onLayoutReady}.
	 * @public
	 * @since 0.9.7
	 */
	layoutReady: boolean;

	/**
	 * Save the state of the current workspace layout.
	 * @public
	 * @since 0.16.0
	 */
	requestSaveLayout: Debouncer<[], Promise<void>>;

	/**
	 * A component managing the current editor.
	 * This can be `null` if the active view has no editor.
	 * @public
	 */
	activeEditor: MarkdownFileInfo | null;

	/**
	 * Runs the callback function right away if layout is already ready,
	 * or push it to a queue to be called later when layout is ready.
	 * @param callback The callback.
	 * @public
	 * @since 0.11.0
	 */
	onLayoutReady(callback: () => any): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Change the layout of the workspace.
	 * @param workspace The layout to apply, as returned by {@link Workspace.getLayout}.
	 * @public
	 * @since 0.9.7
	 */
	changeLayout(workspace: any): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the layout of the workspace.
	 * @public
	 * @since 0.9.7
	 */
	getLayout(): Record<string, unknown> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a leaf in a parent.
	 * @param parent The parent.
	 * @param index The index to insert the leaf at.
	 * @public
	 * @since 0.9.11
	 */
	createLeafInParent(parent: WorkspaceSplit, index: number): WorkspaceLeaf {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a new leaf by splitting an existing leaf.
	 * @param leaf The leaf.
	 * @param direction The direction to split in.
	 * @param before Whether to place the new leaf before the existing leaf.
	 * @public
	 * @since 0.9.7
	 */
	createLeafBySplit(leaf: WorkspaceLeaf, direction?: SplitDirection, before?: boolean): WorkspaceLeaf {
		throw new Error("Method not implemented.");
	}

	/**
	 * Split the active leaf.
	 * @param direction The direction to split in.
	 * @public
	 * @deprecated - You should use {@link Workspace.getLeaf|getLeaf(true)} instead which does the same thing.
	 * @since 0.9.7
	 */
	splitActiveLeaf(direction?: SplitDirection): WorkspaceLeaf {
		throw new Error("Method not implemented.");
	}

	/**
	 * Duplicate a leaf.
	 * @param leaf The leaf.
	 * @param direction The direction to split in.
	 * @public
	 * @deprecated - Use the new form of this method instead
	 * @since 0.13.8
	 */
	duplicateLeaf(leaf: WorkspaceLeaf, direction?: SplitDirection): Promise<WorkspaceLeaf>;

	/**
	 * Duplicate a leaf.
	 * @param leaf The leaf.
	 * @param leafType Where to open the duplicate. See {@link Workspace.getLeaf}.
	 * @param direction The direction to split in, if `leafType` is `'split'`.
	 * @public
	 * @since 1.1.0
	 */
	duplicateLeaf(leaf: WorkspaceLeaf, leafType: PaneType | boolean, direction?: SplitDirection): Promise<WorkspaceLeaf> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the unpinned leaf.
	 * @public
	 * @deprecated - You should use {@link Workspace.getLeaf|getLeaf(false)} instead which does the same thing.
	 */
	getUnpinnedLeaf(): WorkspaceLeaf {
		throw new Error("Method not implemented.");
	}

	/**
	 * Creates a new leaf in a leaf adjacent to the currently active leaf.
	 * If direction is `'vertical'`, the leaf will appear to the right.
	 * If direction is `'horizontal'`, the leaf will appear below the current leaf.
	 *
	 * @public
	 * @since 0.16.0
	 */
	getLeaf(newLeaf?: "split", direction?: SplitDirection): WorkspaceLeaf;

	/**
	 * If newLeaf is `false` (or not set) then an existing leaf which can be navigated
	 * is returned, or a new leaf will be created if there was no leaf available.
	 *
	 * If newLeaf is `'tab'` or `true` then a new leaf will be created in the preferred
	 * location within the root split and returned.
	 *
	 * If newLeaf is `'split'` then a new leaf will be created adjacent to the currently active leaf.
	 *
	 * If newLeaf is `'window'` then a popout window will be created with a new leaf inside.
	 * @param newLeaf Where to open a new leaf, `true` to open a new tab, or `false` to get an existing leaf.
	 * @public
	 * @since 0.16.0
	 */
	getLeaf(newLeaf?: PaneType | boolean): WorkspaceLeaf {
		throw new Error("Method not implemented.");
	}

	/**
	 * Migrates this leaf to a new popout window.
	 * Only works on the desktop app.
	 * @param leaf The leaf.
	 * @param data The size and position of the popout window.
	 * @throws Error if the app does not support popout windows (i.e. on mobile or if Electron version is too old).
	 * @public
	 * @since 0.15.4
	 */
	moveLeafToPopout(leaf: WorkspaceLeaf, data?: WorkspaceWindowInitData): WorkspaceWindow {
		throw new Error("Method not implemented.");
	}

	/**
	 * Open a new popout window with a single new leaf and return that leaf.
	 * Only works on the desktop app.
	 * @param data The size and position of the popout window.
	 * @public
	 * @since 0.15.4
	 */
	openPopoutLeaf(data?: WorkspaceWindowInitData): WorkspaceLeaf {
		throw new Error("Method not implemented.");
	}

	/**
	 * Open a link text.
	 * @param linktext The link text.
	 * @param sourcePath The path of the file containing the link, used to resolve relative links.
	 * @param newLeaf Where to open the link. See {@link Workspace.getLeaf}.
	 * @param openViewState The view state to open the file with.
	 * @public
	 * @since 0.16.0
	 */
	openLinkText(
		linktext: string,
		sourcePath: string,
		newLeaf?: PaneType | boolean,
		openViewState?: OpenViewState,
	): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Sets the active leaf.
	 * @param leaf The leaf.
	 * @param params Parameter object of whether to set the focus.
	 * @public
	 * @since 0.16.3
	 */
	setActiveLeaf(
		leaf: WorkspaceLeaf,
		params?: {
			/** @public */
			focus?: boolean;
		},
	): void;

	/**
	 * Sets the active leaf.
	 * @param leaf The leaf.
	 * @param pushHistory Whether to add the change to the navigation history.
	 * @param focus Whether to focus the leaf.
	 * @deprecated - function signature changed. Use other form instead.
	 * @public
	 */
	setActiveLeaf(leaf: WorkspaceLeaf, pushHistory: boolean, focus: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Retrieve a leaf by its id.
	 * @param id The leaf ID.
	 * @returns The leaf, or `null` if no leaf has this ID.
	 * @public
	 * @since 1.5.1
	 */
	getLeafById(id: string): WorkspaceLeaf | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get all leaves that belong to a group.
	 * @param group The group ID.
	 * @public
	 * @since 0.9.7
	 */
	getGroupLeaves(group: string): WorkspaceLeaf[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the most recently active leaf in a given workspace root. Useful for interacting with the leaf in the root split while a sidebar leaf might be active.
	 * @param root The root to search. If not provided, the `rootSplit` and pop-out windows are searched.
	 * @returns The leaf, or `null` if there is none.
	 * @public
	 * @since 0.15.4
	 */
	getMostRecentLeaf(root?: WorkspaceParent): WorkspaceLeaf | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a new leaf inside the left sidebar.
	 * @param split Whether to create the leaf in a new tab group instead of as a new tab in the existing one.
	 * @public
	 * @since 0.9.7
	 */
	getLeftLeaf(split: boolean): WorkspaceLeaf | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a new leaf inside the right sidebar.
	 * @param split Whether to create the leaf in a new tab group instead of as a new tab in the existing one.
	 * @public
	 * @since 0.9.7
	 */
	getRightLeaf(split: boolean): WorkspaceLeaf | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get side leaf or create one if one does not exist.
	 * @param type The view type.
	 * @param side The sidedock to create the leaf in, if one does not exist.
	 * @param options Whether to make the leaf active, create it in a new tab group, or reveal it (default `true`), and the view state to set.
	 * @public
	 * @since 1.7.2
	 */
	ensureSideLeaf(
		type: string,
		side: Side,
		options?: {
			/** @public */
			active?: boolean;

			/** @public */
			split?: boolean;

			/** @public */
			reveal?: boolean;

			/** @public */
			state?: any;
		},
	): Promise<WorkspaceLeaf> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the currently active view of a given type.
	 * @param type The view class.
	 * @returns The view, or `null` if the active view is not of this type.
	 * @public
	 * @since 0.9.16
	 */
	getActiveViewOfType<T extends View>(type: Constructor<T>): T | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Returns the file for the current view if it's a `FileView`.
	 * Otherwise, it will return the most recently active file.
	 * @returns The file, or `null` if there is none.
	 * @public
	 */
	getActiveFile(): TFile | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Iterate through all leaves in the main area of the workspace.
	 * @param callback Called for each leaf.
	 * @public
	 * @since 0.9.7
	 */
	iterateRootLeaves(callback: (leaf: WorkspaceLeaf) => any): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Iterate through all leaves, including main area leaves, floating leaves, and sidebar leaves.
	 * @param callback Called for each leaf.
	 * @public
	 * @since 0.9.7
	 */
	iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => any): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get all leaves of a given type.
	 * @param viewType The view type.
	 * @public
	 * @since 0.9.7
	 */
	getLeavesOfType(viewType: string): WorkspaceLeaf[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Remove all leaves of the given type.
	 * @param viewType The view type.
	 * @public
	 * @since 0.9.7
	 */
	detachLeavesOfType(viewType: string): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Bring a given leaf to the foreground. If the leaf is in a sidebar, the sidebar will be uncollapsed.
	 * `await` this function to ensure your view has been fully loaded and is not deferred.
	 * @param leaf The leaf.
	 * @public
	 * @since 1.7.2
	 */
	revealLeaf(leaf: WorkspaceLeaf): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the filenames of the 10 most recently opened files.
	 * @public
	 * @since 0.9.7
	 */
	getLastOpenFiles(): string[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Calling this function will update/reconfigure the options of all Markdown views.
	 * It is fairly expensive, so it should not be called frequently.
	 * @public
	 * @since 0.13.21
	 */
	updateOptions(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Add a context menu to internal file links.
	 * @public
	 * @since 0.12.10
	 */
	handleLinkContextMenu(menu: Menu, linktext: string, sourcePath: string, leaf?: WorkspaceLeaf): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * Triggered when the active Markdown file is modified. React to file changes before they
	 * are saved to disk.
	 * @public
	 * @since 0.9.7
	 */
	on(name: "quick-preview", callback: (file: TFile, data: string) => any, ctx?: any): EventRef;

	/**
	 * Triggered when a `WorkspaceItem` is resized or the workspace layout has changed.
	 * @public
	 * @since 0.9.7
	 */
	on(name: "resize", callback: () => any, ctx?: any): EventRef;

	/**
	 * Triggered when the active leaf changes.
	 * @public
	 * @since 0.10.9
	 */
	on(name: "active-leaf-change", callback: (leaf: WorkspaceLeaf | null) => any, ctx?: any): EventRef;

	/**
	 * Triggered when the active file changes. The file could be in a new leaf, an existing leaf,
	 * or an embed.
	 * @public
	 * @since 0.10.9
	 */
	on(name: "file-open", callback: (file: TFile | null) => any, ctx?: any): EventRef;

	/**
	 * Triggered when the layout of the workspace changes.
	 * @public
	 * @since 0.9.20
	 */
	on(name: "layout-change", callback: () => any, ctx?: any): EventRef;

	/**
	 * Triggered when a new popout window is created.
	 * @public
	 * @since 0.15.3
	 */
	on(name: "window-open", callback: (win: WorkspaceWindow, window: Window) => any, ctx?: any): EventRef;

	/**
	 * Triggered when a popout window is closed.
	 * @public
	 * @since 0.15.3
	 */
	on(name: "window-close", callback: (win: WorkspaceWindow, window: Window) => any, ctx?: any): EventRef;

	/**
	 * Triggered when the CSS of the app has changed.
	 * @public
	 * @since 0.9.7
	 */
	on(name: "css-change", callback: () => any, ctx?: any): EventRef;

	/**
	 * Triggered when the user opens the context menu on a file.
	 * @public
	 * @since 0.9.12
	 */
	on(
		name: "file-menu",
		callback: (menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf) => any,
		ctx?: any,
	): EventRef;

	/**
	 * Triggered when the user opens the context menu with multiple files selected in the File Explorer.
	 * @public
	 * @since 1.4.10
	 */
	on(
		name: "files-menu",
		callback: (menu: Menu, files: TAbstractFile[], source: string, leaf?: WorkspaceLeaf) => any,
		ctx?: any,
	): EventRef;

	/**
	 * Triggered when the user opens the context menu on an external URL.
	 * @public
	 * @since 1.5.1
	 */
	on(name: "url-menu", callback: (menu: Menu, url: string) => any, ctx?: any): EventRef;

	/**
	 * Triggered when the user opens the context menu on an editor.
	 * @public
	 * @since 1.1.0
	 */
	on(
		name: "editor-menu",
		callback: (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any,
		ctx?: any,
	): EventRef;

	/**
	 * Triggered when changes to an editor have been applied, either programmatically or from a user event.
	 * @public
	 * @since 1.1.1
	 */
	on(
		name: "editor-change",
		callback: (editor: Editor, info: MarkdownView | MarkdownFileInfo) => any,
		ctx?: any,
	): EventRef;

	/**
	 * Triggered when the editor receives a paste event.
	 * Check for `evt.defaultPrevented` before attempting to handle this event, and return if it has been already handled.
	 * Use `evt.preventDefault()` to indicate that you've handled the event.
	 * @public
	 * @since 1.1.0
	 */
	on(
		name: "editor-paste",
		callback: (evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any,
		ctx?: any,
	): EventRef;

	/**
	 * Triggered when the editor receives a drop event.
	 * Check for `evt.defaultPrevented` before attempting to handle this event, and return if it has been already handled.
	 * Use `evt.preventDefault()` to indicate that you've handled the event.
	 * @public
	 * @since 1.1.0
	 */
	on(
		name: "editor-drop",
		callback: (evt: DragEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => any,
		ctx?: any,
	): EventRef;

	/**
	 * Triggered when the app is about to quit.
	 * Not guaranteed to actually run.
	 * Perform some best effort cleanup here.
	 * @public
	 * @since 0.10.2
	 */
	on(name: "quit", callback: (tasks: Tasks) => any, ctx?: any): EventRef {
		throw new Error("Method not implemented.");
	}
}

/**
 * An item in the workspace layout, such as a leaf or a parent containing other items.
 * @public
 * @since 0.10.2
 */
export abstract class WorkspaceItem extends Events {
	/**
	 * The direct parent of the leaf.
	 * @public
	 * @since 1.6.6
	 */
	abstract parent: WorkspaceParent;

	/**
	 * Get the root container that this item is in.
	 * @public
	 * @since 0.10.2
	 */
	getRoot(): WorkspaceItem {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the root container parent item, which can be one of:
	 * - {@link WorkspaceRoot}
	 * - {@link WorkspaceWindow}
	 * @public
	 * @since 0.15.4
	 */
	getContainer(): WorkspaceContainer {
		throw new Error("Method not implemented.");
	}
}

/**
 * A workspace item that contains other items.
 * @public
 * @since 0.9.7
 */
export abstract class WorkspaceParent extends WorkspaceItem {}

/**
 * A workspace item that lays out its children side by side, either horizontally or vertically.
 * @public
 * @since 0.9.7
 */
export class WorkspaceSplit extends WorkspaceParent {
	/**
	 * The parent of this split.
	 * @public
	 */
	parent: WorkspaceParent;
}

/**
 * A top-level split of the workspace, which belongs to a single window.
 * @public
 * @since 0.15.4
 */
export abstract class WorkspaceContainer extends WorkspaceSplit {
	/**
	 * The window this container is in.
	 * @public
	 * @since 0.15.4
	 */
	abstract win: Window;

	/**
	 * The document this container is in.
	 * @public
	 * @since 0.15.4
	 */
	abstract doc: Document;
}

/**
 * A collapsible split on the left or right side of the workspace.
 * @public
 * @since 0.15.4
 */
export class WorkspaceSidedock extends WorkspaceSplit {
	/**
	 * Whether the sidedock is collapsed.
	 * @public
	 * @since 0.12.11
	 */
	collapsed: boolean;

	/**
	 * Expand the sidedock if it is collapsed, or collapse it otherwise.
	 * @public
	 * @since 0.12.11
	 */
	toggle(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Collapse the sidedock.
	 * @public
	 * @since 0.12.11
	 */
	collapse(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Expand the sidedock.
	 * @public
	 * @since 0.12.11
	 */
	expand(): void {
		throw new Error("Method not implemented.");
	}
}

/**
 * The workspace item that contains all popout windows.
 * @public
 * @since 0.15.2
 */
export class WorkspaceFloating extends WorkspaceParent {
	/**
	 * The parent of this item.
	 * @public
	 * @since 0.15.2
	 */
	parent: WorkspaceParent;
}

/**
 * The mobile version of {@link WorkspaceSidedock}, shown as a drawer.
 * @public
 * @since 1.6.6
 */
export class WorkspaceMobileDrawer extends WorkspaceParent {
	/**
	 * The parent of this drawer.
	 * @public
	 */
	parent: WorkspaceParent;

	/**
	 * Whether the mobile drawer is collapsed.
	 * @public
	 */
	collapsed: boolean;

	/**
	 * Expand the mobile drawer.
	 * @public
	 */
	expand(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Collapse the mobile drawer.
	 * @public
	 */
	collapse(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Expand the mobile drawer if it is collapsed, or collapse it otherwise.
	 * @public
	 */
	toggle(): void {
		throw new Error("Method not implemented.");
	}
}

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
	parent: WorkspaceTabs | WorkspaceMobileDrawer;

	/**
	 * The view associated with this leaf. Do not attempt to cast this to your
	 * custom `View` without first checking `instanceof`.
	 * @public
	 */
	view: View;

	/**
	 * @inheritDoc
	 * @public
	 */
	hoverPopover: HoverPopover | null;

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
	 * @public
	 */
	on(name: "pinned-change", callback: (pinned: boolean) => any, ctx?: any): EventRef;

	/**
	 * Triggered when the group of the leaf changes.
	 * @public
	 */
	on(name: "group-change", callback: (group: string) => any, ctx?: any): EventRef {
		throw new Error("Method not implemented.");
	}
}

/**
 * The ribbon, which shows action icons along the side of the workspace.
 * @public
 */
export class WorkspaceRibbon {}

/**
 * The root split of the workspace in the main window, which contains the main area.
 * @public
 * @since 0.15.2
 */
export class WorkspaceRoot extends WorkspaceContainer {
	/**
	 * The window this container is in.
	 * @public
	 */
	win: Window;

	/**
	 * The document this container is in.
	 * @public
	 */
	doc: Document;
}

/**
 * A tab group, which shows one of its leaves at a time.
 * @public
 */
export class WorkspaceTabs extends WorkspaceParent {
	/**
	 * The parent of this tab group.
	 * @public
	 */
	parent: WorkspaceSplit;
}

/**
 * A popout window in the workspace.
 * @public
 * @since 0.15.4
 */
export class WorkspaceWindow extends WorkspaceContainer {
	/**
	 * The window of the popout.
	 * @public
	 */
	win: Window;

	/**
	 * The document of the popout.
	 * @public
	 */
	doc: Document;
}

/**
 * Options for creating a popout window.
 * @public
 */
export interface WorkspaceWindowInitData {
	/**
	 * The x position of the window on the screen.
	 * @public
	 */
	x?: number;

	/**
	 * The y position of the window on the screen.
	 * @public
	 */
	y?: number;

	/**
	 * The suggested size of the window.
	 * @public
	 */
	size?: {
		/**
		 * The width.
		 * @public
		 */
		width: number;

		/**
		 * The height.
		 * @public
		 */
		height: number;
	};
}
