import { Events } from "../../base/events.js";
import type { WorkspaceContainer, WorkspaceParent } from "./parent.js";
import type { Workspace } from "./workspace.js";

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
	 * Unique identifier for this workspace item.
	 * @unofficial
	 */
	id: string;

	/**
	 * The type identifier for this workspace item.
	 * @unofficial
	 */
	abstract readonly type: string;

	constructor(workspace: Workspace, id?: string) {
		super();
		this.id = id ?? crypto.randomUUID();
	}

	/** @unofficial */
	setParent(parent: WorkspaceParent): void {
		this.parent = parent;
	}

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
