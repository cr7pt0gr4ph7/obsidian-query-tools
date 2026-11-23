export interface AppConfig {
	/** ID That uniquely identifies the vault. */
	appId: string;

	/** The base path of the vault. */
	basePath: string;

	/** The path of the config directory, relative to {@link basePath}. */
	configDir?: string;

	/** Whether absolute paths outside of the {@link basePath} are allowed. */
	allowAbsolutePaths?: boolean;
}
