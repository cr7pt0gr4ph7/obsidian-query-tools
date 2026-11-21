import type { ExtraButtonComponent } from "../components/button.js";
import type { SettingControl } from "./controls.js";
import type { SettingGroup } from "./groups.js";
import type { SettingPage } from "./page.js";
import type { Setting } from "./setting.js";

/**
 * @public
 * @since 1.13.0
 */
export type SettingDefinition<K extends string = string> =
	| SettingDefinitionControl<K>
	| SettingDefinitionRender
	| SettingDefinitionAction
	| SettingDefinitionEmpty;

/**
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionBase {
	/**
	 * Display name — used for rendering and search.
	 * @public
	 * @since 1.13.0
	 */
	name: string;

	/**
	 * Unique identifier to differentiate between sibling settings that share
	 * a name, or to keep a stable reference when a setting or setting page
	 * is renamed. If not set, name is used.
	 * @public
	 * @since 1.14.0
	 */
	id?: string;

	/**
	 * Description text or fragment. Used for rendering; the textContent of a
	 * fragment is used for search.
	 * @public
	 * @since 1.13.0
	 */
	desc?: string | DocumentFragment;

	/**
	 * Additional search terms.
	 * @public
	 * @since 1.13.0
	 */
	aliases?: string[];

	/**
	 * Controls search visibility. `false` or `() => false` excludes from search. Default: true.
	 * @public
	 * @since 1.13.0
	 */
	searchable?: boolean | (() => boolean);

	/**
	 * Controls whether the item is rendered. `false` or `() => false` hides
	 * the item and also excludes it from search for that render cycle.
	 * Evaluated on each render; call `update()` on the setting tab to
	 * re-evaluate after the underlying state changes. Default: true.
	 * @public
	 * @since 1.13.0
	 */
	visible?: boolean | (() => boolean);
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionControl<K extends string = string> extends SettingDefinitionBase {
	/**
	 * @public
	 * @since 1.13.0
	 */
	control: SettingControl<K>;

	/**
	 * @public
	 * @since 1.13.0
	 */
	action?: never;

	/**
	 * @public
	 * @since 1.13.0
	 */
	render?: never;
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionRender extends SettingDefinitionBase {
	/**
	 * @public
	 * @since 1.13.0
	 */
	control?: never;

	/**
	 * @public
	 * @since 1.13.0
	 */
	action?: never;

	/**
	 * Renders the setting row imperatively.
	 *
	 * May return a cleanup function, invoked before the row is torn down.
	 * Not guaranteed to run when the host window is destroyed.
	 * @public
	 * @since 1.13.0
	 */
	render: (setting: Setting, group: SettingGroup) => undefined | (() => void);
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionAction extends SettingDefinitionBase {
	/**
	 * Callback invoked when the action setting is clicked. Receives the row
	 * element and the row's current index within its parent group or list.
	 * @public
	 * @since 1.13.0
	 */
	action: (el: HTMLElement, index: number) => void;

	/**
	 * Disables the row. Evaluated on each render. Call `update()` on the
	 * setting tab to re-evaluate.
	 * @public
	 * @since 1.13.0
	 */
	disabled?: boolean | (() => boolean);

	/**
	 * @public
	 * @since 1.13.0
	 */
	control?: never;

	/**
	 * @public
	 * @since 1.13.0
	 */
	render?: never;
}

/**
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionEmpty extends SettingDefinitionBase {
	/**
	 * @public
	 * @since 1.13.0
	 */
	control?: never;

	/**
	 * @public
	 * @since 1.13.0
	 */
	action?: never;

	/**
	 * @public
	 * @since 1.13.0
	 */
	render?: never;
}

/**
 * A group of settings rendered under a shared heading. Used as an inline
 * group in the array returned by `getSettingDefinitions()`. For collections
 * of mutable data (with add/delete/reorder affordances), use
 * {@link SettingDefinitionList} instead.
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionGroup<K extends string = string> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "group" | "list";

	/**
	 * Unique identifier to differentiate between sibling settings that share
	 * a name, or to keep a stable reference when a setting or setting page
	 * is renamed. If not set, name is used.
	 * @public
	 * @since 1.14.0
	 */
	id?: string;

	/**
	 * Heading text displayed above the group.
	 * @public
	 * @since 1.13.0
	 */
	heading?: string;

	/**
	 * CSS classes to add to the group element.
	 * @public
	 * @since 1.13.0
	 */
	cls?: string;

	/**
	 * Adds a search input to the group header that filters the group's
	 * children by `match(def, query)`. The query is preserved across
	 * re-renders and the filter is reapplied after each render.
	 * @public
	 * @since 1.13.1
	 */
	search?: {
		/**
		 * Placeholder text for the search input.
		 * @public
		 * @since 1.13.1
		 */
		placeholder?: string;

		/**
		 * Predicate called for each direct child definition of this group.
		 * Return true to show the item, false to hide. Items with
		 * `searchable: false` bypass this filter and always show.
		 * @public
		 * @since 1.13.1
		 */
		match: (def: SettingDefinition, query: string) => boolean;
	};

	/**
	 * Extra button configuration for the header.
	 * @public
	 * @since 1.13.0
	 */
	extraButtons?: ((component: ExtraButtonComponent) => any)[];

	/**
	 * Settings within this group.
	 * @public
	 * @since 1.13.0
	 */
	items?: SettingGroupItem<K>[];

	/**
	 * Controls whether the group is rendered. `false` or `() => false` hides
	 * it entirely (heading, controls, and items). Evaluated on each render.
	 * Default: true.
	 * @public
	 * @since 1.13.0
	 */
	visible?: boolean | (() => boolean);
}

/**
 * A single item within a SettingDefinitionGroup — either a setting or a navigable page.
 * @public
 * @since 1.13.0
 */
export type SettingGroupItem<K extends string = string> = SettingDefinition<K> | SettingDefinitionPage<K>;

/**
 * A single item in the array returned by `getSettingDefinitions()`.
 * @public
 * @since 1.13.0
 */
export type SettingDefinitionItem<K extends string = string> =
	| SettingDefinition<K>
	| SettingDefinitionGroup<K>
	| SettingDefinitionList<K>
	| SettingDefinitionPage<K>;

/**
 * A specialized {@link SettingDefinitionGroup} for collections of mutable
 * data: entries the user adds, reorders, or removes. Rendered with a more
 * compact visual style than a group, and supports `emptyState`, `onReorder`,
 * and `onDelete` for the mutation affordances.
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionList<K extends string = string> extends SettingDefinitionGroup<K> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "list";

	/**
	 * Text to display when `items` is empty.
	 * @public
	 * @since 1.13.0
	 */
	emptyState?: string | DocumentFragment;

	/**
	 * When set, adds a drag handle to each item and enables drag-to-reorder. Called with old and new indices.
	 * @public
	 * @since 1.13.0
	 */
	onReorder?: (oldIndex: number, newIndex: number) => void;

	/**
	 * When set, adds a delete button to each item and enables Delete/Backspace keyboard shortcut. Called with the item index.
	 * @public
	 * @since 1.13.0
	 */
	onDelete?: (index: number) => void;

	/**
	 * Add-entry affordance. The framework renders a platform-appropriate
	 * control: on desktop, a `+` button in the list header (with `name` as
	 * the tooltip); on mobile, a tappable `+ {name}` row appended below
	 * the list.
	 *
	 * The mobile row is not part of the indexed `items`: it does not appear
	 * in search, does not receive delete or reorder affordances, and is not
	 * counted by `onDelete`/`onReorder` indices.
	 * @public
	 * @since 1.13.0
	 */
	addItem?: SettingDefinitionAddItem;
}

/**
 * Configuration for a {@link SettingDefinitionList}'s `addItem` affordance.
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionAddItem {
	/**
	 * Mobile row label and desktop button tooltip.
	 * @public
	 * @since 1.13.0
	 */
	name: string;

	/**
	 * Called when the affordance is clicked or tapped. Receives the affordance
	 * element (the `+` button on desktop, the add-item row on mobile).
	 * @public
	 * @since 1.13.0
	 */
	action: (el: HTMLElement) => void;
}

/**
 * A declarative page of settings rendered as a navigable entry.
 * Used as an inline page in the array returned by `getSettingDefinitions()`.
 * @public
 * @since 1.13.0
 */
export interface SettingDefinitionPage<K extends string = string> {
	/**
	 * @public
	 * @since 1.13.0
	 */
	type: "page";

	/**
	 * Display name shown as the navigable entry and page title.
	 * @public
	 * @since 1.13.0
	 */
	name: string;

	/**
	 * Unique identifier to differentiate between sibling settings that share
	 * a name, or to keep a stable reference when a setting or setting page
	 * is renamed. If not set, name is used.
	 * @public
	 * @since 1.14.0
	 */
	id?: string;

	/**
	 * Description shown on the navigable entry.
	 * @public
	 * @since 1.13.0
	 */
	desc?: string | DocumentFragment;

	/**
	 * Surfaces the current value on the entry, so the user can see it without
	 * opening the page where it is edited. Call `update()` on the setting tab
	 * to refresh it after the value changes.
	 * @public
	 * @since 1.13.1
	 */
	displayValue?: string | (() => string);

	/**
	 * Adds a status indicator to the entry. Use `'warning'` when the value on
	 * the page needs the user's attention. Call `update()` on the setting tab
	 * to refresh it after the underlying state changes.
	 * @public
	 * @since 1.13.1
	 */
	status?: "warning" | null | (() => "warning" | null);

	/**
	 * Inline items rendered as a declarative sub-page. Can include groups
	 * and nested pages. Mutually exclusive with `page`.
	 * @public
	 * @since 1.13.0
	 */
	items?: SettingDefinitionItem<K>[];

	/**
	 * Factory for a custom {@link SettingPage} subclass. Use this when the
	 * sub-page is rendered imperatively rather than from a list of
	 * definitions. Mutually exclusive with `items`. The factory is called
	 * each time the page is opened.
	 * @public
	 * @since 1.13.0
	 */
	page?: () => SettingPage;

	/**
	 * Controls whether the page link is rendered. `false` or `() => false`
	 * hides the navigable entry. Evaluated on each render. Default: true.
	 * @public
	 * @since 1.13.0
	 */
	visible?: boolean | (() => boolean);
}
