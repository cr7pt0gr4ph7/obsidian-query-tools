import { BasesViewPluginRegistry } from "./bases.internal.js";
import { CliPluginRegistry } from "./cli.internal.js";
import { CommandPluginRegistry } from "./commands.internal.js";
import { EditorPluginRegistry } from "./editor.internal.js";
import { FileExtensionPluginRegistry } from "./fileextensions.internal.js";
import { HoverPluginRegistry } from "./hover.internal.js";
import { MarkdownProcessorPluginRegistry } from "./markdown.internal.js";
import { ObsidianProtocolHandlerPluginRegistry } from "./protocol.internal.js";
import { RibbonIconPluginRegistry } from "./ribbon.internal.js";
import { SettingsPluginRegistry } from "./settings.internal.js";
import { StatusBarPluginRegistry } from "./statusbar.internal.js";
import { EditorSuggestPluginRegistry } from "./suggest.internal.js";
import { ViewPluginRegistry } from "./views.internal.js";

export function PluginRegistrationMixin<Base extends new (...args: any[]) => {}>(BaseClass: Base) {
	return class extends RibbonIconPluginRegistry(
		StatusBarPluginRegistry(
			CommandPluginRegistry(
				SettingsPluginRegistry(
					ViewPluginRegistry(
						HoverPluginRegistry(
							FileExtensionPluginRegistry(
								MarkdownProcessorPluginRegistry(
									BasesViewPluginRegistry(
										EditorPluginRegistry(
											ObsidianProtocolHandlerPluginRegistry(
												EditorSuggestPluginRegistry(
													CliPluginRegistry(
														//
														BaseClass,
													),
												),
											),
										),
									),
								),
							),
						),
					),
				),
			),
		),
	) {};
}
