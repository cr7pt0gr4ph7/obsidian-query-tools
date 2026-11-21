import { Component } from "../../../../host/obsidian/base/lifecycle.js";
import type { IconName } from "../official_api.js";
import type { App, Menu, Scope } from "../unsupported_api.js";
import type { ViewPlugin } from "./codemirror/view.js";
import type { WorkspaceLeaf } from "./workspace.js";

/**
 * Base class for all views.
 * @public
 * @since 0.9.7
 */
export abstract class View extends Component {
	/**
	 * The app instance.
	 * @public
	 * @since 0.9.7
	 */
	app: App;

	/**
	 * The icon of the view.
	 * @public
	 * @since 1.1.0
	 */
	icon: IconName;

	/**
	 * Whether or not the view is intended for navigation.
	 * If your view is a static view that is not intended to be navigated away, set this to false.
	 * (For example: File explorer, calendar, etc.)
	 * If your view opens a file or can be otherwise navigated, set this to true.
	 * (For example: Markdown editor view, Kanban view, PDF view, etc.)
	 *
	 * @public
	 * @since 0.15.1
	 */
	navigation: boolean;

	/**
	 * The leaf that owns this view.
	 * @public
	 * @since 0.9.7
	 */
	leaf: WorkspaceLeaf;

	/**
	 * The container element.
	 * @public
	 * @since 0.9.7
	 */
	containerEl: HTMLElement;

	/**
	 * Assign an optional scope to your view to register hotkeys for when the view
	 * is in focus.
	 * @example
	 * ```ts
	 * this.scope = new Scope(this.app.scope);
	 * ```
	 * @default `null`
	 * @public
	 * @since 1.5.7
	 */
	scope: Scope | null;

	/**
	 * @param leaf The leaf that owns this view.
	 * @public
	 * @since 0.9.7
	 */
	constructor(leaf: WorkspaceLeaf) {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the view is opened.
	 * @public
	 * @since 0.9.7
	 */
	protected onOpen(): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the view is closed.
	 * @public
	 * @since 0.9.7
	 */
	protected onClose(): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the type of the view.
	 * @public
	 * @since 0.9.7
	 */
	abstract getViewType(): string;

	/**
	 * Get the state of the view.
	 * @public
	 * @since 0.9.7
	 */
	getState(): Record<string, unknown> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the state of the view.
	 * @param state The state.
	 * @param result Set `result.history` to `true` to record the state change in the navigation history.
	 * @example
	 * ```ts
	 * class MyView extends ItemView {
	 *     public override async setState(state: any, result: ViewStateResult): Promise<void> {
	 *         this.foo = state.foo;
	 *         result.history = true;
	 *         await super.setState(state, result);
	 *     }
	 * }
	 * ```
	 * @public
	 * @since 0.9.7
	 */
	setState(state: unknown, result: ViewStateResult): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the ephemeral state of the view.
	 * @public
	 * @since 0.9.7
	 */
	getEphemeralState(): Record<string, unknown> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the ephemeral state of the view.
	 * @param state The ephemeral state.
	 * @public
	 * @since 0.9.7
	 */
	setEphemeralState(state: unknown): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the icon of the view.
	 * @public
	 * @since 1.1.0
	 */
	getIcon(): IconName {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the size of this view is changed.
	 * @public
	 * @since 0.9.7
	 */
	onResize(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the display text of the view.
	 * @public
	 * @since 0.9.7
	 */
	abstract getDisplayText(): string;

	/**
	 * Populates the pane menu.
	 *
	 * (Replaces the previously removed `onHeaderMenu` and `onMoreOptionsMenu`)
	 * @param menu The menu.
	 * @param source Where the menu was opened from, such as `'more-options'` or `'tab-header'`.
	 * @public
	 * @since 0.15.3
	 */
	onPaneMenu(menu: Menu, source: "more-options" | "tab-header" | string): void {
		throw new Error("Method not implemented.");
	}
}

/**
 * A function that creates a view in the given leaf.
 * @public
 */
export type ViewCreator = (leaf: WorkspaceLeaf) => View;

/**
 * The state of the view.
 * @public
 */
export interface ViewState {
	/**
	 * The view type.
	 * @public
	 */
	type: string;

	/**
	 * The state of the view. This gets serialized to the workspace layout.
	 * @public
	 */
	state?: Record<string, unknown>;

	/**
	 * Whether the view is active.
	 * @public
	 */
	active?: boolean;

	/**
	 * Whether the leaf is pinned.
	 * @public
	 */
	pinned?: boolean;

	/**
	 * A leaf to link this leaf with. See {@link WorkspaceLeaf.setGroupMember}.
	 * @public
	 */
	group?: WorkspaceLeaf;
}

/**
 * The result of {@link View.setState}, which the view fills in.
 * @public
 */
export interface ViewStateResult {
	/**
	 * Set this to `true` to indicate that there is a state change which should be recorded in the navigation history.
	 * @public
	 */
	history: boolean;
}

/**
 * A view with a header and a content area. Most custom views should extend this class.
 * @public
 * @since 0.9.7
 */
export abstract class ItemView extends View {
	/**
	 * The content element.
	 * @public
	 */
	contentEl: HTMLElement;

	/**
	 * @inheritDoc
	 * @public
	 */
	constructor(leaf: WorkspaceLeaf) {
		throw new Error("Method not implemented.");
	}

	/**
	 * Add an action to the item view.
	 * @param icon The icon.
	 * @param title The title, shown in a tooltip.
	 * @param callback Called when the action is clicked.
	 * @public
	 * @since 1.1.0
	 */
	addAction(icon: IconName, title: string, callback: (evt: MouseEvent) => any): HTMLElement {
		throw new Error("Method not implemented.");
	}
}

/**
 * A view that works with a file. If the view displays the file, then it should use EditableFileView (or a descendant of it).
 * @public
 */
export abstract class FileView extends ItemView {
	/**
	 * Whether the view may be run without an attached file.
	 * @public
	 */
	allowNoFile: boolean;

	/**
	 * The file being viewed.
	 * @public
	 */
	file: TFile | null;

	/**
	 * Whether the view should get replaced when following a link (`true` by default).
	 * @inheritDoc
	 * @public
	 */
	navigation: boolean;

	/**
	 * @inheritDoc
	 * @public
	 */
	constructor(leaf: WorkspaceLeaf) {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getDisplayText(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	onload(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getState(): Record<string, unknown> {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 * @since 0.9.7
	 */
	setState(state: any, result: ViewStateResult): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the file is loaded.
	 * @param file The file.
	 * @public
	 */
	onLoadFile(file: TFile): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the file is unloaded.
	 * @param file The file.
	 * @public
	 */
	onUnloadFile(file: TFile): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the file is renamed.
	 * @param file The file.
	 * @public
	 */
	onRename(file: TFile): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Whether this file view can open a file with a specified extension.
	 * @param extension The file extension, without the leading dot.
	 * @public
	 * @since 0.9.7
	 */
	canAcceptExtension(extension: string): boolean {
		throw new Error("Method not implemented.");
	}
}

/**
 * A file view whose title can be edited to rename the file. Its content may be read-only, as in the image and PDF views.
 * @public
 * @since 0.9.7
 */
export abstract class EditableFileView extends FileView {}

/**
 * This class implements a plaintext-based editable file view, which can be loaded and saved given an editor.
 *
 * Note that by default, this view only saves when it's closing. To implement auto-save, your editor should
 * call `this.requestSave()` when the content is changed.
 * @public
 * @since 0.10.12
 */
export abstract class TextFileView extends EditableFileView {
	/**
	 * In-memory data.
	 * @public
	 * @since 0.10.12
	 */
	data: string;

	/**
	 * Request a save, debounced by 2 seconds.
	 * @public
	 * @since 0.10.12
	 */
	requestSave: () => void;

	/**
	 * @inheritDoc
	 * @public
	 */
	constructor(leaf: WorkspaceLeaf) {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the file is unloaded. Saves any unsaved changes first.
	 * @param file The file.
	 * @public
	 * @since 0.10.12
	 */
	onUnloadFile(file: TFile): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the file is loaded. Reads the file and passes its contents to {@link TextFileView.setViewData}.
	 * @param file The file.
	 * @public
	 * @since 0.10.12
	 */
	onLoadFile(file: TFile): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Save the file.
	 * @param clear Whether to clear the view after saving.
	 * @public
	 * @since 0.10.12
	 */
	save(clear?: boolean): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Gets the data from the editor. This will be called to save the editor contents to the file.
	 * @public
	 * @since 0.10.12
	 */
	abstract getViewData(): string;

	/**
	 * Set the data to the editor. This is used to load the file contents.
	 *
	 * If `clear` is set, then it means we're opening a completely different file.
	 * In that case, you should call {@link TextFileView.clear}(), or implement a slightly more efficient
	 * clearing mechanism given the new data to be set.
	 * @param data The data.
	 * @param clear Whether a different file is being opened.
	 * @public
	 * @since 0.10.12
	 */
	abstract setViewData(data: string, clear: boolean): void;

	/**
	 * Clear the editor. This is usually called when we're about to open a completely
	 * different file, so it's best to clear any editor states like undo-redo history,
	 * and any caches/indexes associated with the previous file contents.
	 * @public
	 * @since 0.10.12
	 */
	abstract clear(): void;
}

/**
 * CodeMirror {@link ViewPlugin} for Live Preview.
 * @public
 */
export declare const livePreviewState: ViewPlugin<LivePreviewStateType, undefined>;

/**
 * The object stored in the view plugin {@link livePreviewState}.
 * @public
 */
export interface LivePreviewStateType {
	/**
	 * Whether the left mouse is currently held down in the editor
	 * (for example, when drag-to-select text).
	 * @public
	 */
	mousedown: boolean;
}

/**
 * This is the editor for Obsidian Mobile as well as the WYSIWYG editor.
 * @public
 */
export class MarkdownEditView implements MarkdownSubView, HoverParent, MarkdownFileInfo {
	/**
	 * The app instance.
	 * @public
	 */
	app: App;

	/**
	 * @inheritDoc
	 * @public
	 */
	hoverPopover: HoverPopover;

	/**
	 * @param view The Markdown view.
	 * @public
	 */
	constructor(view: MarkdownView) {
		throw new Error("Method not implemented.");
	}

	/**
	 * Clear the content.
	 * @public
	 */
	clear(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the Markdown content.
	 * @public
	 */
	get(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the Markdown content.
	 * @param data The content.
	 * @param clear Whether to clear first.
	 * @public
	 */
	set(data: string, clear: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * The file being edited.
	 * @public
	 */
	get file(): TFile {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the selected text.
	 * @public
	 */
	getSelection(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the scroll position.
	 * @public
	 */
	getScroll(): number {
		throw new Error("Method not implemented.");
	}

	/**
	 * Apply a scroll position.
	 * @param scroll The scroll position.
	 * @public
	 */
	applyScroll(scroll: number): void {
		throw new Error("Method not implemented.");
	}
}

/**
 * Information about a Markdown editor, such as its file and its editor.
 * @public
 */
export interface MarkdownFileInfo extends HoverParent {
	/**
	 * The app instance.
	 * @public
	 */
	app: App;

	/**
	 * The associated file.
	 * @public
	 */
	get file(): TFile | null;

	/**
	 * The editor, if there is one.
	 * @public
	 */
	editor?: Editor;
}

/**
 * The events of the Markdown preview.
 * @public
 */
export interface MarkdownPreviewEvents extends Component {}

/**
 * The renderer of the Markdown preview.
 * @public
 * @since 0.9.7
 */
export class MarkdownPreviewRenderer {
	/**
	 * Register a post processor.
	 * @param postProcessor The post processor.
	 * @param sortOrder The sort order. Determines when this post processor runs with respect to other post processors registered by the core and plugins.
	 * @public
	 * @since 0.10.12
	 */
	static registerPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Unregister a post processor.
	 * @param postProcessor The post processor.
	 * @public
	 * @since 0.9.7
	 */
	static unregisterPostProcessor(postProcessor: MarkdownPostProcessor): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Create a code block post processor.
	 * @param language The language of the code block.
	 * @param handler Renders the code block, given its source, the element to render into, and the context.
	 * @public
	 * @since 0.12.11
	 */
	static createCodeBlockPostProcessor(
		language: string,
		handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | undefined,
	): (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void {
		throw new Error("Method not implemented.");
	}
}

/**
 * A renderer for Markdown.
 * @public
 * @since 0.9.7
 */
export abstract class MarkdownRenderer extends MarkdownRenderChild implements MarkdownPreviewEvents, HoverParent {
	/**
	 * The app instance.
	 * @public
	 */
	app: App;

	/**
	 * The active hover popover, managed by the Workspace.
	 * @public
	 */
	hoverPopover: HoverPopover | null;

	/**
	 * The file being rendered.
	 * @public
	 */
	abstract get file(): TFile;

	/**
	 * Renders Markdown string to an HTML element.
	 * @param markdown The Markdown source code.
	 * @param el The element to append to.
	 * @param sourcePath The normalized path of this Markdown file, used to resolve relative internal links.
	 * @param component A parent component to manage the lifecycle of the rendered child components.
	 * @public
	 * @deprecated - use {@link MarkdownRenderer.render}
	 * @since 0.10.6
	 */
	static renderMarkdown(markdown: string, el: HTMLElement, sourcePath: string, component: Component): Promise<void> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Renders Markdown string to an HTML element.
	 * @param app A reference to the app object.
	 * @param markdown The Markdown source code.
	 * @param el The element to append to.
	 * @param sourcePath The normalized path of this Markdown file, used to resolve relative internal links.
	 * @param component A parent component to manage the lifecycle of the rendered child components.
	 * @public
	 */
	static render(app: App, markdown: string, el: HTMLElement, sourcePath: string, component: Component): Promise<void> {
		throw new Error("Method not implemented.");
	}
}

/**
 * The reading mode of a {@link MarkdownView}.
 * @public
 */
export class MarkdownPreviewView extends MarkdownRenderer implements MarkdownSubView, MarkdownPreviewEvents {
	/**
	 * The container element.
	 * @public
	 */
	containerEl: HTMLElement;

	/**
	 * The file being previewed.
	 * @public
	 */
	get file(): TFile {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the Markdown content.
	 * @public
	 */
	get(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Set the Markdown content.
	 * @param data The content.
	 * @param clear Whether to clear first.
	 * @public
	 */
	set(data: string, clear: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Clear the content.
	 * @public
	 */
	clear(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Force the preview to rerender.
	 * @param full Whether to rerender the entire preview or just the changed parts.
	 * @public
	 */
	rerender(full?: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the scroll position.
	 * @public
	 */
	getScroll(): number {
		throw new Error("Method not implemented.");
	}

	/**
	 * Apply a scroll position.
	 * @param scroll The scroll position.
	 * @public
	 */
	applyScroll(scroll: number): void {
		throw new Error("Method not implemented.");
	}
}

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

/**
 * A view for Markdown files.
 * @public
 */
export class MarkdownView extends TextFileView implements MarkdownFileInfo {
	/**
	 * The editor.
	 * @public
	 */
	editor: Editor;

	/**
	 * The preview mode.
	 * @public
	 */
	previewMode: MarkdownPreviewView;

	/**
	 * The current mode.
	 * @public
	 */
	currentMode: MarkdownSubView;

	/**
	 * @inheritDoc
	 * @public
	 */
	hoverPopover: HoverPopover | null;

	/**
	 * @inheritDoc
	 * @public
	 */
	constructor(leaf: WorkspaceLeaf) {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getViewType(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the current mode of the Markdown view.
	 * @public
	 */
	getMode(): MarkdownViewModeType {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	getViewData(): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	clear(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * @inheritDoc
	 * @public
	 */
	setViewData(data: string, clear: boolean): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Show the search bar in the current mode.
	 * @param replace Whether to also show the replace field.
	 * @public
	 */
	showSearch(replace?: boolean): void {
		throw new Error("Method not implemented.");
	}
}

/**
 * The mode of the Markdown view.
 * @public
 */
export type MarkdownViewModeType = "source" | "preview";
