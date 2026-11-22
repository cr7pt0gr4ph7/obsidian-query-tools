import type { App } from "../../app.js";
import { Component } from "../../base/component.js";
import type { Scope } from "../editor/keyboard.js";
import { createDomElement } from "../fakedom.internal.js";
import type { IconName } from "../icons.js";
import type { Menu } from "../menu.js";
import type { WorkspaceLeaf } from "../workspace/leaf.js";

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
	icon: IconName = "";

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
	navigation: boolean = false;

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
	scope: Scope | null = null;

	/**
	 * @param leaf The leaf that owns this view.
	 * @public
	 * @since 0.9.7
	 */
	constructor(leaf: WorkspaceLeaf) {
		super();
		this.leaf = leaf;
		this.app = leaf.app;
		this.containerEl = createDomElement("div", "view-container");
	}

	/**
	 * Called when the view is opened.
	 * @public
	 * @since 0.9.7
	 */
	protected async onOpen(): Promise<void> {
		// Ignored, as this is a stub implementation.
	}

	/**
	 * Called when the view is closed.
	 * @public
	 * @since 0.9.7
	 */
	protected async onClose(): Promise<void> {
		// Ignored, as this is a stub implementation.
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
