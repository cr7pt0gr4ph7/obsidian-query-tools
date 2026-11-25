import type { App } from "../app.js";
import { Component } from "../base/component.js";
import type { Debouncer } from "../base/debounce.js";
import type { CachedMetadata } from "../cache/cache.js";
import type { TFile } from "../files/files.js";
import type { PropertyInfo, TypeInfo } from "./property.unofficial.js";
import type { PropertyWidget, PropertyWidgetEntry, PropertyWidgetType } from "./property_widget.unofficial.js";
import type {
	AliasesPropertyWidgetComponent,
	CheckboxPropertyWidgetComponent,
	DatePropertyWidgetComponent,
	DatetimePropertyWidgetComponent,
	FilePropertyWidgetComponent,
	FolderPropertyWidgetComponent,
	MultitextPropertyWidgetComponent,
	NumberPropertyWidgetComponent,
	PropertyPropertyWidgetComponent,
	TagsPropertyWidgetComponent,
	TextPropertyWidgetComponent,
} from "./property_widget_component.js";

/**
 * Manager for frontmatter property types, handling registration and assignment of property widgets.
 *
 * @unofficial
 */
export class MetadataTypeManager extends Component {
	/**
	 * Associated widget types for each property.
	 */
	assignedWidgets: MetadataTypeManagerTypesRecord = {};

	/**
	 * Unix timestamp of the last save
	 */
	lastSave: number;

	/**
	 * Debounced handler for property type config file changes on disk.
	 */
	onConfigFileChange: Debouncer<[], Promise<void>>;

	/**
	 * Registered properties of the vault.
	 */
	properties: MetadataTypeManagerPropertiesRecord = {};

	/**
	 * Registered type widgets.
	 */
	registeredTypeWidgets: MetadataTypeManagerRegisteredTypeWidgetsRecord = {
		aliases: {} as any,
		checkbox: {} as any,
		date: {} as any,
		datetime: {} as any,
		file: {} as any,
		folder: {} as any,
		multitext: {} as any,
		number: {} as any,
		property: {} as any,
		tags: {} as any,
		text: {} as any,
	};

	/**
	 * @param app Reference to the {@link obsidian#App}.
	 */
	constructor(public app: App) {
		super();
	}

	/**
	 * Get all registered properties of the vault.
	 *
	 * @returns Record of property names to their info.
	 */
	getAllProperties(): Record<string, PropertyInfo> {
		return { ...this.properties };
	}

	/**
	 * Get assigned widget type for property.
	 *
	 * @param property - Property name.
	 * @returns The assigned widget type, or `null`.
	 */
	getAssignedWidget(property: string): null | PropertyWidgetType {
		return this.assignedWidgets[property]?.widget ?? null;
	}

	/**
	 * Get info for property.
	 *
	 * @param property - Property name.
	 * @returns Information about the property.
	 */
	getPropertyInfo(property: string): PropertyInfo {
		// TODO: Error handling if property is not found?
		return this.properties[property];
	}

	/**
	 * Counts the notes whose frontmatter carries each property.
	 *
	 * @returns Record of lowercased property names to the number of notes using them.
	 */
	getPropertyOccurrences(): Record<string, number> {
		const occurrences: Record<string, number> = {};
		for (const property in this.properties) {
			occurrences[property.toLowerCase()] = 0;
		}
		for (const file of this.app.vault.getMarkdownFiles()) {
			const cache = this.app.metadataCache.getFileCache(file);
			if (!cache?.frontmatter) {
				continue;
			}
			for (const property in cache.frontmatter) {
				const key = property.toLowerCase();
				if (key in occurrences) {
					occurrences[key]++;
				}
			}
		}
		return occurrences;
	}

	/**
	 * Get expected widget type for property and the one inferred from the property value.
	 *
	 * @param property - Property name.
	 * @param value - Property value.
	 * @returns Type information for the property.
	 */
	getTypeInfo(property: string, value: unknown): TypeInfo {
		const expected = this.getWidget(this.assignedWidgets[property]?.widget ?? "text");
		const inferred = this.inferWidgetFromValue(value);
		return { expected, inferred };
	}

	/**
	 * Infer the widget type from a property value.
	 *
	 * @param value - The property value.
	 * @returns The inferred widget type.
	 * @internal
	 */
	inferWidgetFromValue(value: unknown): PropertyWidget {
		// Stub implementation: always returns the text widget.
		return this.registeredTypeWidgets.text;
	}

	/**
	 * Get property widget.
	 *
	 * @param type - Widget type name.
	 * @returns The property widget.
	 */
	getWidget(type: string): PropertyWidget {
		return this.registeredTypeWidgets[type];
	}

	/**
	 * Load metadata type configuration.
	 */
	async load(): Promise<void> {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Load property types from config.
	 *
	 * @returns A promise that resolves when the property types are loaded.
	 */
	async loadData(): Promise<void> {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Handles the metadata cache `changed` event: records the frontmatter properties of the changed note, inferring
	 * the widget of each property that has no assigned type.
	 *
	 * @param file - The changed file.
	 * @param data - The file contents.
	 * @param cache - The file's new metadata.
	 */
	onCacheChanged(file: TFile, data: string, cache: CachedMetadata): void {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Handles the metadata cache `finished` event once: unsubscribes and rebuilds the properties.
	 */
	onCacheFinished(): void {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Handle raw file system change events for the property type config.
	 *
	 * @param e - The raw file system change event.
	 */
	onRaw(e: unknown): void {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Handles a vault config change: rebuilds the properties on the next frame when `userIgnoreFilters` changed.
	 *
	 * @param configKey - The changed config key.
	 */
	onVaultConfigChanged(configKey: string): void {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Rebuilds {@link MetadataTypeManager.properties} from the assigned widgets and the frontmatter of every cached note.
	 */
	rebuildProperties(): void {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Register event listeners for property type config file changes.
	 */
	registerListeners(): void {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Save property types to config.
	 *
	 * @returns A promise that resolves when the property types are saved.
	 */
	save(): Promise<void> {
		// Ignored, as this is a stub implementation
		return Promise.resolve();
	}

	/**
	 * Set widget type for property.
	 *
	 * @param property - Property name.
	 * @param type - Widget type to assign.
	 * @returns A promise that resolves when the widget type is set.
	 */
	async setType(property: string, type: PropertyWidgetType): Promise<void> {
		// Ignored, as this is a stub implementation
	}

	/**
	 * Unset widget type for property.
	 *
	 * @param property - Property name.
	 * @returns A promise that resolves when the widget type is unset.
	 */
	async unsetType(property: string): Promise<void> {
		// Ignored, as this is a stub implementation
	}
}

/**
 * Record mapping property names to their metadata information across the vault.
 *
 * @public
 * @unofficial
 */
export interface MetadataTypeManagerPropertiesRecord extends Record<string, PropertyInfo> {}

/**
 * Registered type widgets.
 *
 * @public
 * @unofficial
 */
export interface MetadataTypeManagerRegisteredTypeWidgetsRecord extends Record<PropertyWidgetType, PropertyWidget> {
	/**
	 * Property widget for aliases.
	 */
	aliases: PropertyWidget<AliasesPropertyWidgetComponent>;
	/**
	 * Property widget for checkboxes.
	 */
	checkbox: PropertyWidget<CheckboxPropertyWidgetComponent>;
	/**
	 * Property widget for dates.
	 */
	date: PropertyWidget<DatePropertyWidgetComponent>;
	/**
	 * Property widget for datetimes.
	 */
	datetime: PropertyWidget<DatetimePropertyWidgetComponent>;
	/**
	 * Property widget for files.
	 */
	file: PropertyWidget<FilePropertyWidgetComponent>;
	/**
	 * Property widget for folders.
	 */
	folder: PropertyWidget<FolderPropertyWidgetComponent>;
	/**
	 * Property widget for multitexts.
	 */
	multitext: PropertyWidget<MultitextPropertyWidgetComponent>;
	/**
	 * Property widget for numbers.
	 */
	number: PropertyWidget<NumberPropertyWidgetComponent>;
	/**
	 * Property widget for properties.
	 */
	property: PropertyWidget<PropertyPropertyWidgetComponent>;
	/**
	 * Property widget for tags.
	 */
	tags: PropertyWidget<TagsPropertyWidgetComponent>;
	/**
	 * Property widget for text.
	 */
	text: PropertyWidget<TextPropertyWidgetComponent>;
}

/**
 * Record mapping property names to their assigned widget entries.
 *
 * @public
 * @unofficial
 */
export interface MetadataTypeManagerTypesRecord extends Record<string, PropertyWidgetEntry> {}

/**
 * Base interface for metadata property widgets that render value inputs.
 *
 * @public
 * @unofficial
 */
export type MetadataWidget = {};
