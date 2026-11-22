export function createDomElement(tagName: string, explanation?: string, parent?: HTMLElement) {
	const element = (parent?.ownerDocument ?? document).createElement(tagName);
	if (explanation) {
		element.setAttribute("data-explanation", explanation);
	}
	if (parent) {
		parent.appendChild(element);
	}
	return element;
}
