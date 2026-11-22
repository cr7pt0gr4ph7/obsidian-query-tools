import { WorkspaceItem } from "./item.js";

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
	declare parent: WorkspaceParent;
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
	declare collapsed: boolean;

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
	declare parent: WorkspaceParent;
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
	declare parent: WorkspaceParent;

	/**
	 * Whether the mobile drawer is collapsed.
	 * @public
	 */
	declare collapsed: boolean;

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
 * The root split of the workspace in the main window, which contains the main area.
 * @public
 * @since 0.15.2
 */
export class WorkspaceRoot extends WorkspaceContainer {
	/**
	 * The window this container is in.
	 * @public
	 */
	declare win: Window;

	/**
	 * The document this container is in.
	 * @public
	 */
	declare doc: Document;
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
	declare parent: WorkspaceSplit;
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
	declare win: Window;

	/**
	 * The document of the popout.
	 * @public
	 */
	declare doc: Document;
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
