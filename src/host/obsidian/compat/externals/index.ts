import Moment from "moment";

/**
 * The `Moment.js` library.
 * @public
 */
export const moment: typeof Moment = Moment;

/**
 * Load MathJax.
 * @see {@link https://www.mathjax.org/ Official MathJax documentation}.
 * @public
 */
export function loadMathJax(): Promise<void> {
	return Promise.resolve();
}

/**
 * Flush the MathJax stylesheet.
 * @public
 */
export function finishRenderMath(): Promise<void> {
	return Promise.resolve();
}

/**
 * Render some LaTeX math using the MathJax engine. Returns an HTMLElement.
 * Requires calling `finishRenderMath` when rendering is all done to flush the MathJax stylesheet.
 * @param source The LaTeX source code.
 * @param display Whether to render the math in display mode.
 * @public
 */
export function renderMath(source: string, display: boolean): HTMLElement {
	throw new Error("Method not implemented.");
}

class MermaidMock {}

/**
 * Load Mermaid and return a promise to the global mermaid object.
 * Can also use `window.mermaid` after this promise resolves to get the same reference.
 * @see {@link https://mermaid.js.org/ Official Mermaid documentation}.
 * @public
 */
export function loadMermaid(): Promise<any> {
	const w = window as any;
	// biome-ignore lint/suspicious/noAssignInExpressions: It's shorter this way
	return Promise.resolve(w.mermaid ?? (w.mermaid = new MermaidMock()));
}

class PdfJsMock {}

/**
 * Load PDF.js and return a promise to the global pdfjsLib object.
 * Can also use `window.pdfjsLib` after this promise resolves to get the same reference.
 * @see {@link https://mozilla.github.io/pdf.js/ Official PDF.js documentation}.
 * @public
 */
export function loadPdfJs(): Promise<any> {
	const w = window as any;
	// biome-ignore lint/suspicious/noAssignInExpressions: It's shorter this way
	return Promise.resolve(w.pdfjsLib ?? (w.pdfjsLib = new PdfJsMock()));
}

class PrismMock {}

/**
 * Load Prism.js and return a promise to the global Prism object.
 * Can also use `window.Prism` after this promise resolves to get the same reference.
 * @see {@link https://prismjs.com/ Official Prism documentation}.
 * @public
 */
export function loadPrism(): Promise<any> {
	const w = window as any;
	// biome-ignore lint/suspicious/noAssignInExpressions: It's shorter this way
	return Promise.resolve(w.Prism ?? (w.Prism = new PrismMock()));
}
