type FileExtension = string;
type ViewType = string;

export interface IFileExtensionPluginRegistry {
	/**
	 * Register a set of extensions for a view type.
	 * @param extensions The file extensions to register, without the leading dot.
	 * @param viewType The view type to open these files in.
	 * @public
	 * @since 0.9.7
	 */
	registerExtensions(extensions: FileExtension[], viewType: ViewType): void;
}

export function FileExtensionPluginRegistry<TBase extends new (...args: any[]) => any>(Base: TBase) {
	return class extends Base implements IFileExtensionPluginRegistry {
		_fileExtensions: Record<FileExtension, ViewType> = {};

		registerExtensions(extensions: FileExtension[], viewType: ViewType): void {
			for (const ext of extensions) {
				this._fileExtensions[ext] = viewType;
			}
		}
	};
}
