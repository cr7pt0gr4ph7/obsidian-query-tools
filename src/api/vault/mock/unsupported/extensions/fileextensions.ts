export interface IFileExtensionPlugin_ {
	/**
	 * Register a set of extensions for a view type.
	 * @param extensions The file extensions to register, without the leading dot.
	 * @param viewType The view type to open these files in.
	 * @public
	 * @since 0.9.7
	 */
	registerExtensions(extensions: string[], viewType: string): void;
}
