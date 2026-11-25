import type { App } from "../app.js";
import type { FocusMode } from "../base/focusmode.unofficial.js";

/**
 * Property widget type.
 *
 * @public
 * @unofficial
 */
export type PropertyWidgetType =
	| "aliases"
	| "checkbox"
	| "date"
	| "datetime"
	| "multitext"
	| "number"
	| "tags"
	| "text"
	| string;

/**
 * Property widget.
 *
 * @typeParam ComponentType - The type of the component.
 * @public
 * @unofficial
 */
export class PropertyWidget<ComponentType extends PropertyWidgetComponentBase = PropertyWidgetComponentBase> {
	/**
	 * Lucide-dev icon associated with the widget.
	 */
	icon: string;

	/**
	 * Reserved keys for the widget.
	 */
	reservedKeys?: string[];

	/**
	 * Identifier for the widget.
	 */
	type: string;

	/**
	 * Returns the I18N name of the widget.
	 *
	 * @returns The localized name of the widget.
	 */
	name(): string {
		// Ignored, as this is a stub implementation
		return "";
	}
	/**
	 * Render function for the widget on field container given context and data.
	 *
	 * @param containerEl - The container element to render the widget into.
	 * @param data - The property data to render.
	 * @param context - The rendering context for the property.
	 * @returns The rendered widget component.
	 */
	render(containerEl: HTMLElement, data: unknown, context: PropertyRenderContext): ComponentType {
		// Ignored, as this is a stub implementation
		return {} as any as ComponentType;
	}

	/**
	 * Validate whether the input value to the widget is correct.
	 *
	 * @param value - The value to validate.
	 * @returns Whether the value is valid.
	 */
	validate(value: unknown): boolean {
		return true;
	}
}
/**
 * Base class for property widget components.
 *
 * @public
 * @unofficial
 */
export interface PropertyWidgetComponentBase {
	/**
	 * The type of the property widget.
	 */
	type: string;

	/**
	 * Focus the property widget.
	 *
	 * @param mode - The focus mode.
	 */
	focus(mode?: FocusMode): void;
}
/**
 * Entry associating a display name with a property widget type.
 * @unofficial
 */
export interface PropertyWidgetEntry {
	/**
	 * Display name of the property widget.
	 */
	name: string;

	/**
	 * The property widget type.
	 */
	widget: PropertyWidgetType;
}

/**
 * Context provided to property widgets for rendering and interaction.
 * @unofficial
 */
export class PropertyRenderContext {
	/**
	 * Reference to the app.
	 */
	app: App;

	/**
	 * Key of the property field.
	 */
	key: string;

	/**
	 * Determine the source path of current context.
	 */
	sourcePath: string;

	/**
	 * Callback called on property field unfocus.
	 */
	blur(): void {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Filter applied by the property-value suggest to its plain-text suggestions.
	 *
	 * @param value - The suggested value.
	 * @returns Whether to keep the suggestion.
	 */
	filterSuggestion?(value: string): boolean {
		// Ignored, as this is a stub implementation
		return true;
	}

	/**
	 * Callback called on property value change.
	 *
	 * @param value - The new property value.
	 */
	onChange(value: unknown): void {
		// Ignored, as this is a stub implementation
	}
}
