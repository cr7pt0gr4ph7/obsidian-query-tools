export interface IStatusBarPlugin_ {  
	/**
	 * Adds a status bar item to the bottom of the app.
	 * Not available on mobile.
     * 
	 * @see {@link https://docs.obsidian.md/Plugins/User+interface/Status+bar}.
	 * @returns The HTMLElement of the status bar item.
	 * @public
	 * @since 0.9.7
	 */
	addStatusBarItem(): HTMLElement;
}
