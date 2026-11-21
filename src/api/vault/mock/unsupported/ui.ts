/**
 * An instruction shown in a suggestion modal.
 * @example
 * ```ts
 * const instruction: Instruction = { command: '↑↓', purpose: 'Navigate' };
 * ```
 * @public
 * @since 0.9.20
 */
export interface Instruction {
	/**
	 * The command or the key combination.
	 * @public
	 * @since 0.9.20
	 */
	command: string;

	/**
	 * The purpose of the command.
	 * @public
	 * @since 0.9.20
	 */
	purpose: string;
}
