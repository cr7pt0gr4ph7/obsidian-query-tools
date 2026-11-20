declare global {
	interface ObjectConstructor {
		/**
		 * Checks if an object is empty.
		 * @param object The object.
		 * @example
		 * ```ts
		 * console.log(Object.isEmpty({})); // true
		 * console.log(Object.isEmpty({ a: 1 })); // false
		 * ```
		 */
		isEmpty(object: Record<string, any>): boolean;
		/**
		 * Iterates over the own properties of an object, stopping early if the callback returns `false`.
		 * @param object The object.
		 * @param callback Called for each property. Return `false` to stop iterating.
		 * @param context The `this` value for the callback.
		 * @returns `false` if the callback returned `false`, `true` otherwise.
		 * @example
		 * ```ts
		 * console.log(Object.each({ a: 1, b: 2 }, function(this: { min: number }, value) { return value > this.min }, { min: 0 })); // true
		 * console.log(Object.each({ a: 1, b: 2 }, function(this: { min: number }, value) { return value > this.min }, { min: 1 })); // false
		 * ```
		 */
		each<T>(
			object: {
				[key: string]: T;
			},
			callback: (value: T, key?: string) => boolean | void,
			context?: any,
		): boolean;
	}
	interface ArrayConstructor {
		/**
		 * Combines an array of arrays into a single array.
		 * @param arrays The arrays.
		 * @example
		 * ```ts
		 * console.log(Array.combine([[1, 2], [3, 4], [5, 6]])); // [1, 2, 3, 4, 5, 6]
		 * ```
		 */
		combine<T>(arrays: T[][]): T[];
	}
	interface Array<T> {
		/**
		 * Returns the first element of the array, or `undefined` if the array is empty.
		 * @example
		 * ```ts
		 * console.log([1, 2, 3].first()); // 1
		 * console.log([].first()); // undefined
		 * ```
		 */
		first(): T | undefined;
		/**
		 * Returns the last element of the array, or `undefined` if the array is empty.
		 * @example
		 * ```ts
		 * console.log([1, 2, 3].last()); // 3
		 * console.log([].last()); // undefined
		 * ```
		 */
		last(): T | undefined;
		/**
		 * Checks if the array contains a specific element.
		 * @param target The element.
		 * @example
		 * ```ts
		 * console.log([1, 2, 3].contains(2)); // true
		 * console.log([1, 2, 3].contains(4)); // false
		 * ```
		 */
		contains(target: T): boolean;
		/**
		 * Removes all occurrences of an element from the array, in place.
		 * @param target The element.
		 * @example
		 * ```ts
		 * let arr = [1, 2, 3];
		 * arr.remove(2);
		 * console.log(arr); // [1, 3]
		 * arr = [1, 2, 3];
		 * arr.remove(4);
		 * console.log(arr); // [1, 2, 3]
		 * ```
		 * @remarks The original version had return type `this`.
		 * See bug: {@link https://forum.obsidian.md/t/bug-array-remove-definition/98101}.
		 */
		remove(target: T): void;
		/**
		 * Shuffles the array in place.
		 * @example
		 * ```ts
		 * const arr = [1, 2, 3];
		 * console.log(arr.shuffle()); // something like [2, 3, 1]
		 * console.log(arr); // same as above
		 * ```
		 */
		shuffle(): this;
		/**
		 * Returns a new array with unique elements.
		 */
		unique(): T[];
		/**
		 * Returns the index of the last element that satisfies the predicate, or `-1` if there is none.
		 * @param predicate The predicate.
		 * @example
		 * ```ts
		 * console.log([1, 2, 3, 2, 1].findLastIndex(x => x === 2)); // 3
		 * console.log([1, 2, 3, 2, 1].findLastIndex(x => x === 4)); // -1
		 * ```
		 * @since 1.4.4
		 */
		findLastIndex(predicate: (value: T) => boolean): number;
	}
	interface Math {
		/**
		 * Clamps a value between a minimum and maximum.
		 * @param value The value.
		 * @param min The minimum value.
		 * @param max The maximum value.
		 * @example
		 * ```ts
		 * console.log(Math.clamp(10, 0, 5)); // 5
		 * console.log(Math.clamp(-10, 0, 5)); // 0
		 * console.log(Math.clamp(3, 0, 5)); // 3
		 * ```
		 */
		clamp(value: number, min: number, max: number): number;
		/**
		 * Returns the square of a number.
		 * @param value The number.
		 * @example
		 * ```ts
		 * console.log(Math.square(2)); // 4
		 * console.log(Math.square(-2)); // 4
		 * ```
		 */
		square(value: number): number;
	}
	interface StringConstructor {
		/**
		 * Type guard to check if a value is a string.
		 * @param obj The value.
		 * @example
		 * ```ts
		 * console.log(String.isString('foo')); // true
		 * console.log(String.isString(123)); // false
		 * ```
		 */
		isString(obj: any): obj is string;
	}
	interface String {
		/**
		 * Checks if the string contains a specific substring.
		 * @param target The substring.
		 * @example
		 * ```ts
		 * console.log('foo'.contains('oo')); // true
		 * console.log('foo'.contains('bar')); // false
		 * ```
		 */
		contains(target: string): boolean;
		/**
		 * Checks if the string starts with a specific substring.
		 * @param searchString The substring.
		 * @param position The index to start the search at.
		 * @example
		 * ```ts
		 * console.log('foo'.startsWith('fo')); // true
		 * console.log('foo'.startsWith('oo')); // false
		 * console.log('foo'.startsWith('foo', 1)); // false
		 * console.log('foo'.startsWith('oo', 1)); // true
		 * ```
		 */
		startsWith(searchString: string, position?: number): boolean;
		/**
		 * Checks if the string ends with a specific substring.
		 * @param searchString The substring.
		 * @param endPosition The index to end the search at.
		 * @example
		 * ```ts
		 * console.log('foo'.endsWith('oo')); // true
		 * console.log('foo'.endsWith('fo')); // false
		 * console.log('foo'.endsWith('foo', 2)); // false
		 * console.log('foo'.endsWith('fo', 2)); // true
		 * ```
		 */
		endsWith(searchString: string, endPosition?: number): boolean;
		/**
		 * Formats a string using the indexed placeholders.
		 * @param args The values for the `{0}`, `{1}`, ... placeholders.
		 * @example
		 * ```ts
		 * console.log('foo {0} bar {1} baz {0}'.format('qux', 'quux')); // foo qux bar quux baz qux
		 * ```
		 */
		format(...args: string[]): string;
	}
	interface NumberConstructor {
		/**
		 * Type guard to check if a value is a number.
		 * @param obj The value.
		 * @example
		 * ```ts
		 * console.log(Number.isNumber(123)); // true
		 * console.log(Number.isNumber('123')); // false
		 * console.log(Number.isNumber(NaN)); // true
		 * console.log(Number.isNumber(Infinity)); // true
		 * console.log(Number.isNumber(-Infinity)); // true
		 * ```
		 * @remarks Regarding `NaN` see: {@link https://forum.obsidian.md/t/bug-number-isnumber-definition/98104}.
		 */
		isNumber(obj: any): obj is number;
	}
	interface Node {
		/**
		 * Detaches the node from the DOM.
		 * @example
		 * ```ts
		 * const node = document.body.createEl('p');
		 * console.log(document.body.contains(node)); // true
		 * node.detach();
		 * console.log(document.body.contains(node)); // false
		 * ```
		 */
		detach(): void;
		/**
		 * Removes all children of the node.
		 * @example
		 * ```ts
		 * const parent = createEl('p');
		 * parent.createEl('strong');
		 * console.log(parent.childNodes.length); // 1
		 * parent.empty();
		 * console.log(parent.childNodes.length); // 0
		 * ```
		 */
		empty(): void;
		/**
		 * Inserts a node as a child of this node, right after the given child.
		 * @param node The node.
		 * @param child The child to insert after, or `null` to insert at the start.
		 * @example
		 * ```ts
		 * const parent = createEl('p');
		 * const child1 = parent.createEl('strong', { text: '1' });
		 * const child2 = parent.createEl('strong', { text: '2' });
		 * const child3 = parent.createEl('strong', { text: '3' });
		 * const newNode = createEl('em', { text: '4' });
		 * parent.insertAfter(newNode, child2);
		 * console.log(parent); // <p><strong>1</strong><strong>2</strong><em>4</em><strong>3</strong></p>
		 * ```
		 */
		insertAfter<T extends Node>(node: T, child: Node | null): T;
		/**
		 * Returns the index of a child node within this node's child nodes, or `-1` if it is not a child.
		 * @param other The child node.
		 */
		indexOf(other: Node): number;
		/**
		 * Replaces the children of this node with the given nodes, keeping existing children in place where possible.
		 * @param children The new children, in order.
		 * @example
		 * ```ts
		 * const parent = createEl('p');
		 * const child1 = parent.createEl('strong', { text: '1' });
		 * const child2 = parent.createEl('strong', { text: '2' });
		 * const child3 = createEl('strong', { text: '3' });
		 * parent.setChildrenInPlace([child1, child3]);
		 * console.log(parent); // <p><strong>1</strong><strong>3</strong></p>
		 * ```
		 */
		setChildrenInPlace(children: Node[]): void;
		/**
		 * Appends a text node to the node.
		 * @param val The text.
		 * @example
		 * ```ts
		 * const parent = createEl('p');
		 * parent.createEl('strong', { text: 'foo' });
		 * parent.appendText('bar');
		 * console.log(parent); // <p><strong>foo</strong>bar</p>
		 * ```
		 */
		appendText(val: string): void;
		/**
		 * Cross-window capable instanceof check, a drop-in replacement
		 * for instanceof checks on DOM Nodes. Remember to also check
		 * for nulls when necessary.
		 * @param type The type.
		 * @example
		 * ```ts
		 * const node = createEl('p');
		 * console.log(node.instanceOf(HTMLParagraphElement)); // true
		 * console.log(node.instanceOf(HTMLSpanElement)); // false
		 * ```
		 */
		instanceOf<T>(type: { new (): T }): this is T;
		/**
		 * The document this node belongs to, or the global document.
		 */
		doc: Document;
		/**
		 * The window object this node belongs to, or the global window.
		 */
		win: Window;
		/**
		 * The window whose constructors were used to create this node.
		 * Usually the same as `win`, but can differ after the node is moved to another window.
		 */
		constructorWin: Window;
	}
	interface Element extends Node {
		/**
		 * Returns the text content of the element.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.createEl('strong', { text: 'foo' });
		 * element.createEl('strong', { text: 'bar' });
		 * console.log(element.getText()); // foobar
		 * ```
		 */
		getText(): string;
		/**
		 * Sets the text content of the element.
		 * @param val The text, or a node to replace the content with.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.setText('foo');
		 * console.log(element); // <p>foo</p>
		 * const fragment = createFragment();
		 * fragment.createEl('strong', { text: 'bar' });
		 * element.setText(fragment);
		 * console.log(element); // <p><strong>bar</strong></p>
		 * ```
		 */
		setText(val: string | DocumentFragment): void;
		/**
		 * Adds one or more classes to the element.
		 * @param classes The classes.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * console.log(element.className); // foo bar
		 * ```
		 */
		addClass(...classes: string[]): void;
		/**
		 * Adds multiple classes to the element.
		 * @param classes The classes.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClasses(['foo', 'bar']);
		 * console.log(element.className); // foo bar
		 * ```
		 */
		addClasses(classes: string[]): void;
		/**
		 * Removes one or more classes from the element.
		 * @param classes The classes.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * element.removeClass('foo', 'baz');
		 * console.log(element.className); // bar
		 * ```
		 */
		removeClass(...classes: string[]): void;
		/**
		 * Removes multiple classes from the element.
		 * @param classes The classes.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * element.removeClasses(['foo', 'baz']);
		 * console.log(element.className); // bar
		 * ```
		 */
		removeClasses(classes: string[]): void;
		/**
		 * Adds or removes one or more classes on the element.
		 * @param classes The class or classes.
		 * @param value If `true`, the classes will be added. If `false`, they will be removed.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * element.toggleClass('foo', false);
		 * console.log(element.className); // bar
		 * element.toggleClass('foo', true);
		 * console.log(element.className); // bar foo
		 * element.toggleClass('baz', false);
		 * console.log(element.className); // bar foo
		 * element.toggleClass('baz', true);
		 * console.log(element.className); // bar foo baz
		 * ```
		 */
		toggleClass(classes: string | string[], value: boolean): void;
		/**
		 * Checks if the element has a class.
		 * @param cls The class.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * console.log(element.hasClass('foo')); // true
		 * console.log(element.hasClass('baz')); // false
		 * ```
		 */
		hasClass(cls: string): boolean;
		/**
		 * Sets an attribute on the element.
		 * @param qualifiedName The attribute name.
		 * @param value The value, or `null` to remove the attribute.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.setAttr('data-foo', 'bar');
		 * console.log(element.getAttr('data-foo')); // bar
		 * ```
		 */
		setAttr(qualifiedName: string, value: string | number | boolean | null): void;
		/**
		 * Sets multiple attributes on the element.
		 * @param obj The attributes. A `null` value removes the attribute.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.setAttrs({
		 *     'data-foo': 'bar',
		 *     'data-baz': 'qux',
		 * });
		 * console.log(element.getAttr('data-foo')); // bar
		 * console.log(element.getAttr('data-baz')); // qux
		 * ```
		 */
		setAttrs(obj: { [key: string]: string | number | boolean | null }): void;
		/**
		 * Gets an attribute from the element.
		 * @param qualifiedName The attribute name.
		 * @returns The value, or `null` if the element does not have the attribute.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.setAttr('data-foo', 'bar');
		 * console.log(element.getAttr('data-foo')); // bar
		 * ```
		 */
		getAttr(qualifiedName: string): string | null;
		/**
		 * Returns the closest element that matches the selector, starting with this element and walking up the DOM tree.
		 * @param selector The selector.
		 * @param lastParent The ancestor to stop at. It is still checked against the selector.
		 * @returns The matching element, or `null` if none is found.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * console.log(element.matchParent('p')); // <p></p>
		 * console.log(element.matchParent('strong')); // null
		 * const child = element.createEl('strong');
		 * console.log(child.matchParent('strong')); // <strong></strong>
		 * console.log(child.matchParent('p')); // <p></p>
		 * const grandchild = child.createEl('em');
		 * console.log(grandchild.matchParent('p', child)); // null
		 * ```
		 */
		matchParent(selector: string, lastParent?: Element): Element | null;
		/**
		 * Gets the computed value of a CSS property of the element.
		 * @param property The CSS property.
		 * @param pseudoElement The pseudo-element, e.g. `'::after'`.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * element.style.color = 'red';
		 * console.log(element.getCssPropertyValue('color')); // rgb(255, 0, 0)
		 * console.log(element.getCssPropertyValue('color', ':after')); // rgb(255, 0, 0)
		 * ```
		 */
		getCssPropertyValue(property: string, pseudoElement?: string): string;
		/**
		 * Checks if the element is focused, taking iframes and the active window into account.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * console.log(element.isActiveElement()); // false
		 * console.log(document.activeElement?.isActiveElement()); // true
		 * ```
		 */
		isActiveElement(): boolean;
	}
	interface HTMLElement extends Element {
		/**
		 * Shows the element by restoring its CSS `display` property, if it was hidden with `hide()`.
		 */
		show(): void;
		/**
		 * Hides the element by setting its CSS `display` property to `none`.
		 */
		hide(): void;
		/**
		 * Shows or hides the element using its CSS `display` property.
		 * @param show Whether to show the element.
		 * @example
		 * ```ts
		 * document.body.toggle(true);
		 * document.body.toggle(false);
		 * ```
		 */
		toggle(show: boolean): void;
		/**
		 * Shows or hides the element using its CSS `visibility` property.
		 * @param visible Whether to show the element.
		 * @example
		 * ```ts
		 * document.body.toggleVisibility(true);
		 * document.body.toggleVisibility(false);
		 * ```
		 */
		toggleVisibility(visible: boolean): void;
		/**
		 * Returns whether this element is shown, when the element is attached to the DOM and
		 * none of the parent and ancestor elements are hidden with `display: none`.
		 *
		 * Exception: Does not work on `<body>` and `<html>`, or on elements with `position: fixed`.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * console.log(element.isShown()); // true
		 * element.hide();
		 * console.log(element.isShown()); // false
		 * ```
		 */
		isShown(): boolean;
		/**
		 * Sets the CSS styles of the element.
		 * @param styles The styles.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * element.setCssStyles({ color: 'red', fontSize: '16px' });
		 * ```
		 */
		setCssStyles(styles: Partial<CSSStyleDeclaration>): void;
		/**
		 * Sets the CSS properties of the element.
		 * @param props The CSS properties.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * element.setCssProps({ color: 'red', 'font-size': '16px' });
		 * ```
		 */
		setCssProps(props: Record<string, string>): void;
		/**
		 * Get the inner width of this element without padding.
		 */
		readonly innerWidth: number;
		/**
		 * Get the inner height of this element without padding.
		 */
		readonly innerHeight: number;
	}
	interface SVGElement extends Element {
		/**
		 * Sets the CSS styles of the element.
		 * @param styles The styles.
		 * @example
		 * ```ts
		 * const element = document.body.createSvg('svg');
		 * element.setCssStyles({ color: 'red', fontSize: '16px' });
		 * ```
		 */
		setCssStyles(styles: Partial<CSSStyleDeclaration>): void;
		/**
		 * Sets the CSS properties of the element.
		 * @param props The CSS properties.
		 * @example
		 * ```ts
		 * const element = document.body.createSvg('svg');
		 * element.setCssProps({ color: 'red', 'font-size': '16px' });
		 * ```
		 */
		setCssProps(props: Record<string, string>): void;
	}
	/**
	 * Checks if a value is a boolean.
	 * @param obj The value.
	 * @example
	 * ```ts
	 * console.log(isBoolean(false)); // true
	 * console.log(isBoolean('not a boolean')); // false
	 * ```
	 */
	function isBoolean(obj: any): obj is boolean;
	/**
	 * Finds the first element in the document that matches the selector, or `null` if none match.
	 * @param selector The CSS selector.
	 * @example
	 * ```ts
	 * const element = document.body.createEl('p');
	 * element.createEl('strong', { cls: 'foo' });
	 * console.log(fish('.foo')); // <strong class="foo"></strong>
	 * console.log(fish('.bar')); // null
	 * ```
	 */
	function fish(selector: string): HTMLElement | null;
	/**
	 * Finds all elements in the document that match the selector.
	 * @param selector The CSS selector.
	 * @example
	 * ```ts
	 * const element = document.body.createEl('p');
	 * element.createEl('strong', { cls: 'foo' });
	 * element.createEl('strong', { cls: 'foo' });
	 * console.log(fishAll('.foo')); // [<strong class="foo"></strong>, <strong class="foo"></strong>]
	 * console.log(fishAll('.bar')); // []
	 * ```
	 */
	function fishAll(selector: string): HTMLElement[];
	interface Element extends Node {
		/**
		 * Finds the first descendant element that matches the selector, or `null` if none match.
		 * @param selector The CSS selector.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.createEl('strong', { cls: 'foo' });
		 * console.log(element.find('.foo')); // <strong class="foo"></strong>
		 * console.log(element.find('.bar')); // null
		 * ```
		 */
		find(selector: string): Element | null;
		/**
		 * Finds all descendant elements that match the selector.
		 * @param selector The CSS selector.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.createEl('strong', { cls: 'foo' });
		 * element.createEl('strong', { cls: 'foo' });
		 * console.log(element.findAll('.foo')); // [<strong class="foo"></strong>, <strong class="foo"></strong>]
		 * console.log(element.findAll('.bar')); // []
		 * ```
		 * @remarks See bug {@link https://forum.obsidian.md/t/bug-find-findall-findallself/98108}.
		 */
		findAll(selector: string): HTMLElement[];
		/**
		 * Finds this element and all descendant elements that match the selector.
		 * @param selector The CSS selector.
		 * @returns The matching elements, starting with this element if it matches.
		 * @example
		 * ```ts
		 * const element = createEl('p', { cls: 'foo' });
		 * element.createEl('strong', { cls: 'foo' });
		 * console.log(element.findAllSelf('.foo')); // [<p class="foo"></p>, <strong class="foo"></strong>]
		 * console.log(element.findAllSelf('.bar')); // []
		 * ```
		 * @remarks See bug {@link https://forum.obsidian.md/t/bug-find-findall-findallself/98108}.
		 */
		findAllSelf(selector: string): HTMLElement[];
	}
	interface HTMLElement extends Element {
		find(selector: string): HTMLElement;
		findAll(selector: string): HTMLElement[];
		findAllSelf(selector: string): HTMLElement[];
	}
	interface DocumentFragment extends Node, NonElementParentNode, ParentNode {
		/**
		 * Finds the first descendant element that matches the selector, or `null` if none match.
		 * @param selector The CSS selector.
		 * @example
		 * ```ts
		 * const fragment = createFragment();
		 * fragment.createEl('strong', { cls: 'foo' });
		 * console.log(fragment.find('.foo')); // <strong class="foo"></strong>
		 * console.log(fragment.find('.bar')); // null
		 * ```
		 * @remarks See bug {@link https://forum.obsidian.md/t/bug-find-findall-findallself/98108}.
		 */
		find(selector: string): HTMLElement | null;
		/**
		 * Finds all descendant elements that match the selector.
		 * @param selector The CSS selector.
		 * @example
		 * ```ts
		 * const fragment = createFragment();
		 * fragment.createEl('strong', { cls: 'foo' });
		 * fragment.createEl('strong', { cls: 'foo' });
		 * console.log(fragment.findAll('.foo')); // [<strong class="foo"></strong>, <strong class="foo"></strong>]
		 * console.log(fragment.findAll('.bar')); // []
		 * ```
		 * @remarks See bug {@link https://forum.obsidian.md/t/bug-find-findall-findallself/98108}.
		 */
		findAll(selector: string): HTMLElement[];
	}
	/**
	 * Options object passed to {@link createEl}.
	 */
	interface DomElementInfo {
		/**
		 * The class to be assigned. Can be a space-separated string or an array of strings.
		 * @example
		 * ```ts
		 * createEl('p', { cls: 'foo bar' });
		 * createEl('p', { cls: ['foo', 'bar'] });
		 * ```
		 */
		cls?: string | string[];
		/**
		 * The textContent to be assigned.
		 * @example
		 * ```ts
		 * createEl('p', { text: 'foo' });
		 * const fragment = createFragment();
		 * fragment.createEl('strong', { text: 'bar' });
		 * createEl('p', { text: fragment });
		 * ```
		 */
		text?: string | DocumentFragment;
		/**
		 * HTML attributes to be added.
		 */
		attr?: {
			[key: string]: string | number | boolean | null;
		};
		/**
		 * HTML title (for hover tooltip).
		 */
		title?: string;
		/**
		 * The parent element to be assigned to.
		 */
		parent?: Node;
		/**
		 * Only applies to `<input>`, `<select>`, and `<option>` elements.
		 */
		value?: string;
		/**
		 * Only applies to `<input>` and `<style>` elements.
		 */
		type?: string;
		/**
		 * Whether to insert the element as the first child of the parent, instead of the last.
		 */
		prepend?: boolean;
		/**
		 * Only applies to `<input>` elements.
		 */
		placeholder?: string;
		/**
		 * Only applies to `<a>`, `<link>`, and `<base>` elements.
		 */
		href?: string;
	}
	/**
	 * Options object passed to {@link createSvg}.
	 */
	interface SvgElementInfo {
		/**
		 * The class to be assigned. Can be a space-separated string or an array of strings.
		 * @example
		 * ```ts
		 * createSvg('svg', { cls: 'foo bar' });
		 * createSvg('svg', { cls: ['foo', 'bar'] });
		 * ```
		 */
		cls?: string | string[];
		/**
		 * HTML attributes to be added.
		 */
		attr?: {
			[key: string]: string | number | boolean | null;
		};
		/**
		 * The parent element to be assigned to.
		 */
		parent?: Node;
		/**
		 * Whether to insert the element as the first child of the parent, instead of the last.
		 */
		prepend?: boolean;
	}
	interface Node {
		/**
		 * Create an element and append it to this node.
		 * @param tag The tag name.
		 * @param o The options, or a CSS class to add.
		 * @param callback Called with the new element before it is appended.
		 * @example
		 * ```ts
		 * document.body.createEl('p', { text: 'foo' }, (p) => {
		 *     p.createEl('strong', { text: 'bar' });
		 * });
		 * ```
		 */
		createEl<K extends keyof HTMLElementTagNameMap>(
			tag: K,
			o?: DomElementInfo | string,
			callback?: (el: HTMLElementTagNameMap[K]) => void,
		): HTMLElementTagNameMap[K];
		/**
		 * Create a `<div>` element and append it to this node.
		 * @param o The options, or a CSS class to add.
		 * @param callback Called with the new element before it is appended.
		 * @example
		 * ```ts
		 * document.body.createDiv({ text: 'foo' }, (div) => {
		 *     div.createEl('strong', { text: 'bar' });
		 * });
		 * ```
		 */
		createDiv(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void): HTMLDivElement;
		/**
		 * Create a `<span>` element and append it to this node.
		 * @param o The options, or a CSS class to add.
		 * @param callback Called with the new element before it is appended.
		 * @example
		 * ```ts
		 * document.body.createSpan({ text: 'foo' }, (span) => {
		 *     span.createEl('strong', { text: 'bar' });
		 * });
		 * ```
		 */
		createSpan(o?: DomElementInfo | string, callback?: (el: HTMLSpanElement) => void): HTMLSpanElement;
		/**
		 * Create an SVG element such as `<svg>`, `<circle>` or `<rect>` and append it to this node.
		 * @param tag The tag name.
		 * @param o The options, or a CSS class to add.
		 * @param callback Called with the new element before it is appended.
		 * @example
		 * ```ts
		 * document.body.createSvg('svg', { cls: 'foo bar' }, (svg) => {
		 *     svg.createSvg('circle');
		 * });
		 * ```
		 */
		createSvg<K extends keyof SVGElementTagNameMap>(
			tag: K,
			o?: SvgElementInfo | string,
			callback?: (el: SVGElementTagNameMap[K]) => void,
		): SVGElementTagNameMap[K];
	}
	/**
	 * Creates a new element.
	 * @param tag The tag name.
	 * @param o The options, or a CSS class to add.
	 * @param callback Called with the new element before it is appended to the parent.
	 * @example
	 * ```ts
	 * createEl('p', { text: 'foo' }, (p) => {
	 *     p.createEl('strong', { text: 'bar' });
	 * });
	 * ```
	 */
	function createEl<K extends keyof HTMLElementTagNameMap>(
		tag: K,
		o?: DomElementInfo | string,
		callback?: (el: HTMLElementTagNameMap[K]) => void,
	): HTMLElementTagNameMap[K];
	/**
	 * Creates a new `<div>` element.
	 * @param o The options, or a CSS class to add.
	 * @param callback Called with the new element before it is appended to the parent.
	 * @example
	 * ```ts
	 * createDiv({ text: 'foo' }, (div) => {
	 *     div.createEl('strong', { text: 'bar' });
	 * });
	 * ```
	 */
	function createDiv(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void): HTMLDivElement;
	/**
	 * Creates a new `<span>` element.
	 * @param o The options, or a CSS class to add.
	 * @param callback Called with the new element before it is appended to the parent.
	 * @example
	 * ```ts
	 * createSpan({ text: 'foo' }, (span) => {
	 *     span.createEl('strong', { text: 'bar' });
	 * });
	 * ```
	 */
	function createSpan(o?: DomElementInfo | string, callback?: (el: HTMLSpanElement) => void): HTMLSpanElement;
	/**
	 * Creates a new SVG element such as `<svg>`, `<circle>` or `<rect>`.
	 * @param tag The tag name.
	 * @param o The options, or a CSS class to add.
	 * @param callback Called with the new element before it is appended to the parent.
	 * @example
	 * ```ts
	 * createSvg('svg', { cls: 'foo bar' }, (svg) => {
	 *     svg.createSvg('circle');
	 * });
	 * ```
	 */
	function createSvg<K extends keyof SVGElementTagNameMap>(
		tag: K,
		o?: SvgElementInfo | string,
		callback?: (el: SVGElementTagNameMap[K]) => void,
	): SVGElementTagNameMap[K];
	/**
	 * Creates a new document fragment.
	 * @param callback Called with the new fragment.
	 * @example
	 * ```ts
	 * createFragment((fragment) => {
	 *     fragment.createEl('p', { text: 'foo' });
	 * });
	 * ```
	 */
	function createFragment(callback?: (el: DocumentFragment) => void): DocumentFragment;
	/**
	 * Information about a delegated event listener added with `on()`.
	 */
	interface EventListenerInfo {
		/**
		 * The selector that the event target, or one of its ancestors, must match.
		 */
		selector: string;
		/**
		 * The listener passed to `on()`.
		 */
		listener: Function;
		/**
		 * The options passed to `on()`.
		 */
		options?: boolean | AddEventListenerOptions;
		/**
		 * The wrapper function registered with `addEventListener`, which calls the listener when the selector matches.
		 */
		callback: Function;
	}
	interface HTMLElement extends Element {
		/**
		 * The delegated event listeners added to the element with `on()`, grouped by event type.
		 */
		_EVENTS?: {
			[K in keyof HTMLElementEventMap]?: EventListenerInfo[];
		};
		/**
		 * Adds a delegated event listener to the element. The listener is called when the event target,
		 * or one of its ancestors, matches the selector.
		 * @param type The event type.
		 * @param selector The CSS selector.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 */
		on<K extends keyof HTMLElementEventMap>(
			this: HTMLElement,
			type: K,
			selector: string,
			listener: (this: HTMLElement, ev: HTMLElementEventMap[K], delegateTarget: HTMLElement) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
		/**
		 * Removes a delegated event listener that was added with `on()`.
		 * The arguments must match the ones that were passed to `on()`.
		 * @param type The event type.
		 * @param selector The CSS selector.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 * @example
		 * ```ts
		 * const listener = (ev: MouseEvent) => console.log(ev);
		 * document.body.on('click', 'div', listener);
		 * document.body.off('click', 'div', listener);
		 * ```
		 */
		off<K extends keyof HTMLElementEventMap>(
			this: HTMLElement,
			type: K,
			selector: string,
			listener: (this: HTMLElement, ev: HTMLElementEventMap[K], delegateTarget: HTMLElement) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
		/**
		 * Adds a listener for both `click` and `auxclick` (e.g. middle click) events to the element.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 */
		onClickEvent(
			this: HTMLElement,
			listener: (this: HTMLElement, ev: MouseEvent) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
		/**
		 * Registers a callback to be called when this element is inserted into the DOM.
		 * @param listener The callback.
		 * @param once If `true`, this will only fire once and then unhook itself.
		 * @returns A function that unregisters the callback, to avoid memory leaks.
		 */
		onNodeInserted(this: HTMLElement, listener: () => any, once?: boolean): () => void;
		/**
		 * Registers a callback to be called when this element is moved to another window.
		 * @param listener The callback, called with the new window.
		 * @returns A function that unregisters the callback, to avoid memory leaks.
		 */
		onWindowMigrated(this: HTMLElement, listener: (win: Window) => any): () => void;
		/**
		 * Dispatches a bubbling event of the given type on the element.
		 * @param eventType The event type.
		 */
		trigger(eventType: string): void;
	}
	interface Document {
		/**
		 * The delegated event listeners added to the document with `on()`, grouped by event type.
		 */
		_EVENTS?: {
			[K in keyof DocumentEventMap]?: EventListenerInfo[];
		};
		/**
		 * Adds a delegated event listener to the document. The listener is called when the event target,
		 * or one of its ancestors, matches the selector.
		 * @param type The event type.
		 * @param selector The CSS selector.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 */
		on<K extends keyof DocumentEventMap>(
			this: Document,
			type: K,
			selector: string,
			listener: (this: Document, ev: DocumentEventMap[K], delegateTarget: HTMLElement) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
		/**
		 * Removes a delegated event listener that was added with `on()`.
		 * The arguments must match the ones that were passed to `on()`.
		 * @param type The event type.
		 * @param selector The CSS selector.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 * @example
		 * ```ts
		 * const listener = (ev: MouseEvent) => console.log(ev);
		 * document.on('click', 'div', listener);
		 * document.off('click', 'div', listener);
		 * ```
		 */
		off<K extends keyof DocumentEventMap>(
			this: Document,
			type: K,
			selector: string,
			listener: (this: Document, ev: DocumentEventMap[K], delegateTarget: HTMLElement) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
	}
	interface UIEvent extends Event {
		/**
		 * The target node of the event.
		 */
		targetNode: Node | null;
		/**
		 * The window in which the event occurred.
		 */
		win: Window;
		/**
		 * The document in which the event occurred.
		 */
		doc: Document;
		/**
		 * Cross-window capable instanceof check, a drop-in replacement
		 * for instanceof checks on UIEvents.
		 * @param type The type.
		 * @example
		 * ```ts
		 * if (event.instanceOf(MouseEvent)) {
		 *     console.log('event is a mouse event');
		 * }
		 * ```
		 */
		instanceOf<T>(type: { new (...data: any[]): T }): this is T;
	}
	/**
	 * Options for an {@link ajax} request.
	 */
	interface AjaxOptions {
		/**
		 * The HTTP method. Defaults to `'GET'`.
		 */
		method?: "GET" | "POST";
		/**
		 * The request URL.
		 */
		url: string;
		/**
		 * Called when the request completes with a status code from 200 to 399.
		 */
		success?: (response: any, req: XMLHttpRequest) => any;
		/**
		 * Called when the request fails or completes with any other status code.
		 */
		error?: (error: any, req: XMLHttpRequest) => any;
		/**
		 * The request body. Objects are sent as JSON.
		 */
		data?: object | string | ArrayBuffer;
		/**
		 * The request headers.
		 */
		headers?: Record<string, string>;
		/**
		 * Whether to send credentials.
		 * Defaults to `true` if `data` is set, `false` otherwise.
		 */
		withCredentials?: boolean;
		/**
		 * Set to the underlying `XMLHttpRequest` once the request is sent.
		 */
		req?: XMLHttpRequest;
	}
	/**
	 * Sends an AJAX request.
	 * @param options The request options.
	 * @example
	 * ```ts
	 * ajax({
	 *     url: 'https://example.com',
	 *     success: (response) => {
	 *         console.log(response);
	 *     },
	 *     error: (error) => {
	 *         console.error(error);
	 *     }
	 * });
	 * ```
	 */
	function ajax(options: AjaxOptions): void;
	/**
	 * Sends an AJAX request.
	 * @param options The request options.
	 * @returns The response. Rejects with the `XMLHttpRequest` if the request fails.
	 * @example
	 * ```ts
	 * const response = await ajaxPromise({ url: 'https://example.com' });
	 * console.log(response);
	 * ```
	 */
	function ajaxPromise(options: AjaxOptions): Promise<any>;
	/**
	 * Executes a function when the DOM is ready, or immediately if it already is.
	 * @param fn The function.
	 */
	function ready(fn: () => any): void;
	/**
	 * Sleeps for a given number of milliseconds.
	 * @param ms The number of milliseconds.
	 */
	function sleep(ms: number): Promise<void>;
	/**
	 * Waits for the next animation frame.
	 */
	function nextFrame(): Promise<void>;
	/**
	 * The actively focused Window object. This is usually the same as `window` but
	 * it will be different when using popout windows.
	 */
	let activeWindow: Window;
	/**
	 * The actively focused Document object. This is usually the same as `document` but
	 * it will be different when using popout windows.
	 */
	let activeDocument: Document;
	interface Window
		extends EventTarget,
			AnimationFrameProvider,
			GlobalEventHandlers,
			WindowEventHandlers,
			WindowLocalStorage,
			WindowOrWorkerGlobalScope,
			WindowSessionStorage {
		/**
		 * The actively focused Window object. This is usually the same as `window` but
		 * it will be different when using popout windows.
		 */
		activeWindow: Window;
		/**
		 * The actively focused Document object. This is usually the same as `document` but
		 * it will be different when using popout windows.
		 */
		activeDocument: Document;
		/**
		 * Sleeps for a given number of milliseconds.
		 * @param ms The number of milliseconds.
		 */
		sleep(ms: number): Promise<void>;
		/**
		 * Waits for the next animation frame.
		 * @returns A promise that resolves on the next animation frame.
		 */
		nextFrame(): Promise<void>;
	}
	interface Touch {
		/**
		 * The type of touch.
		 */
		touchType: "stylus" | "direct";
	}
}
declare global {
	interface ObjectConstructor {
		/**
		 * Checks if an object is empty.
		 * @param object The object.
		 * @example
		 * ```ts
		 * console.log(Object.isEmpty({})); // true
		 * console.log(Object.isEmpty({ a: 1 })); // false
		 * ```
		 */
		isEmpty(object: Record<string, any>): boolean;
		/**
		 * Iterates over the own properties of an object, stopping early if the callback returns `false`.
		 * @param object The object.
		 * @param callback Called for each property. Return `false` to stop iterating.
		 * @param context The `this` value for the callback.
		 * @returns `false` if the callback returned `false`, `true` otherwise.
		 * @example
		 * ```ts
		 * console.log(Object.each({ a: 1, b: 2 }, function(this: { min: number }, value) { return value > this.min }, { min: 0 })); // true
		 * console.log(Object.each({ a: 1, b: 2 }, function(this: { min: number }, value) { return value > this.min }, { min: 1 })); // false
		 * ```
		 */
		each<T>(
			object: {
				[key: string]: T;
			},
			callback: (value: T, key?: string) => boolean | void,
			context?: any,
		): boolean;
	}
	interface ArrayConstructor {
		/**
		 * Combines an array of arrays into a single array.
		 * @param arrays The arrays.
		 * @example
		 * ```ts
		 * console.log(Array.combine([[1, 2], [3, 4], [5, 6]])); // [1, 2, 3, 4, 5, 6]
		 * ```
		 */
		combine<T>(arrays: T[][]): T[];
	}
	interface Array<T> {
		/**
		 * Returns the first element of the array, or `undefined` if the array is empty.
		 * @example
		 * ```ts
		 * console.log([1, 2, 3].first()); // 1
		 * console.log([].first()); // undefined
		 * ```
		 */
		first(): T | undefined;
		/**
		 * Returns the last element of the array, or `undefined` if the array is empty.
		 * @example
		 * ```ts
		 * console.log([1, 2, 3].last()); // 3
		 * console.log([].last()); // undefined
		 * ```
		 */
		last(): T | undefined;
		/**
		 * Checks if the array contains a specific element.
		 * @param target The element.
		 * @example
		 * ```ts
		 * console.log([1, 2, 3].contains(2)); // true
		 * console.log([1, 2, 3].contains(4)); // false
		 * ```
		 */
		contains(target: T): boolean;
		/**
		 * Removes all occurrences of an element from the array, in place.
		 * @param target The element.
		 * @example
		 * ```ts
		 * let arr = [1, 2, 3];
		 * arr.remove(2);
		 * console.log(arr); // [1, 3]
		 * arr = [1, 2, 3];
		 * arr.remove(4);
		 * console.log(arr); // [1, 2, 3]
		 * ```
		 * @remarks The original version had return type `this`.
		 * See bug: {@link https://forum.obsidian.md/t/bug-array-remove-definition/98101}.
		 */
		remove(target: T): void;
		/**
		 * Shuffles the array in place.
		 * @example
		 * ```ts
		 * const arr = [1, 2, 3];
		 * console.log(arr.shuffle()); // something like [2, 3, 1]
		 * console.log(arr); // same as above
		 * ```
		 */
		shuffle(): this;
		/**
		 * Returns a new array with unique elements.
		 */
		unique(): T[];
		/**
		 * Returns the index of the last element that satisfies the predicate, or `-1` if there is none.
		 * @param predicate The predicate.
		 * @example
		 * ```ts
		 * console.log([1, 2, 3, 2, 1].findLastIndex(x => x === 2)); // 3
		 * console.log([1, 2, 3, 2, 1].findLastIndex(x => x === 4)); // -1
		 * ```
		 * @since 1.4.4
		 */
		findLastIndex(predicate: (value: T) => boolean): number;
	}
	interface Math {
		/**
		 * Clamps a value between a minimum and maximum.
		 * @param value The value.
		 * @param min The minimum value.
		 * @param max The maximum value.
		 * @example
		 * ```ts
		 * console.log(Math.clamp(10, 0, 5)); // 5
		 * console.log(Math.clamp(-10, 0, 5)); // 0
		 * console.log(Math.clamp(3, 0, 5)); // 3
		 * ```
		 */
		clamp(value: number, min: number, max: number): number;
		/**
		 * Returns the square of a number.
		 * @param value The number.
		 * @example
		 * ```ts
		 * console.log(Math.square(2)); // 4
		 * console.log(Math.square(-2)); // 4
		 * ```
		 */
		square(value: number): number;
	}
	interface StringConstructor {
		/**
		 * Type guard to check if a value is a string.
		 * @param obj The value.
		 * @example
		 * ```ts
		 * console.log(String.isString('foo')); // true
		 * console.log(String.isString(123)); // false
		 * ```
		 */
		isString(obj: any): obj is string;
	}
	interface String {
		/**
		 * Checks if the string contains a specific substring.
		 * @param target The substring.
		 * @example
		 * ```ts
		 * console.log('foo'.contains('oo')); // true
		 * console.log('foo'.contains('bar')); // false
		 * ```
		 */
		contains(target: string): boolean;
		/**
		 * Checks if the string starts with a specific substring.
		 * @param searchString The substring.
		 * @param position The index to start the search at.
		 * @example
		 * ```ts
		 * console.log('foo'.startsWith('fo')); // true
		 * console.log('foo'.startsWith('oo')); // false
		 * console.log('foo'.startsWith('foo', 1)); // false
		 * console.log('foo'.startsWith('oo', 1)); // true
		 * ```
		 */
		startsWith(searchString: string, position?: number): boolean;
		/**
		 * Checks if the string ends with a specific substring.
		 * @param searchString The substring.
		 * @param endPosition The index to end the search at.
		 * @example
		 * ```ts
		 * console.log('foo'.endsWith('oo')); // true
		 * console.log('foo'.endsWith('fo')); // false
		 * console.log('foo'.endsWith('foo', 2)); // false
		 * console.log('foo'.endsWith('fo', 2)); // true
		 * ```
		 */
		endsWith(searchString: string, endPosition?: number): boolean;
		/**
		 * Formats a string using the indexed placeholders.
		 * @param args The values for the `{0}`, `{1}`, ... placeholders.
		 * @example
		 * ```ts
		 * console.log('foo {0} bar {1} baz {0}'.format('qux', 'quux')); // foo qux bar quux baz qux
		 * ```
		 */
		format(...args: string[]): string;
	}
	interface NumberConstructor {
		/**
		 * Type guard to check if a value is a number.
		 * @param obj The value.
		 * @example
		 * ```ts
		 * console.log(Number.isNumber(123)); // true
		 * console.log(Number.isNumber('123')); // false
		 * console.log(Number.isNumber(NaN)); // true
		 * console.log(Number.isNumber(Infinity)); // true
		 * console.log(Number.isNumber(-Infinity)); // true
		 * ```
		 * @remarks Regarding `NaN` see: {@link https://forum.obsidian.md/t/bug-number-isnumber-definition/98104}.
		 */
		isNumber(obj: any): obj is number;
	}
	interface Node {
		/**
		 * Detaches the node from the DOM.
		 * @example
		 * ```ts
		 * const node = document.body.createEl('p');
		 * console.log(document.body.contains(node)); // true
		 * node.detach();
		 * console.log(document.body.contains(node)); // false
		 * ```
		 */
		detach(): void;
		/**
		 * Removes all children of the node.
		 * @example
		 * ```ts
		 * const parent = createEl('p');
		 * parent.createEl('strong');
		 * console.log(parent.childNodes.length); // 1
		 * parent.empty();
		 * console.log(parent.childNodes.length); // 0
		 * ```
		 */
		empty(): void;
		/**
		 * Inserts a node as a child of this node, right after the given child.
		 * @param node The node.
		 * @param child The child to insert after, or `null` to insert at the start.
		 * @example
		 * ```ts
		 * const parent = createEl('p');
		 * const child1 = parent.createEl('strong', { text: '1' });
		 * const child2 = parent.createEl('strong', { text: '2' });
		 * const child3 = parent.createEl('strong', { text: '3' });
		 * const newNode = createEl('em', { text: '4' });
		 * parent.insertAfter(newNode, child2);
		 * console.log(parent); // <p><strong>1</strong><strong>2</strong><em>4</em><strong>3</strong></p>
		 * ```
		 */
		insertAfter<T extends Node>(node: T, child: Node | null): T;
		/**
		 * Returns the index of a child node within this node's child nodes, or `-1` if it is not a child.
		 * @param other The child node.
		 */
		indexOf(other: Node): number;
		/**
		 * Replaces the children of this node with the given nodes, keeping existing children in place where possible.
		 * @param children The new children, in order.
		 * @example
		 * ```ts
		 * const parent = createEl('p');
		 * const child1 = parent.createEl('strong', { text: '1' });
		 * const child2 = parent.createEl('strong', { text: '2' });
		 * const child3 = createEl('strong', { text: '3' });
		 * parent.setChildrenInPlace([child1, child3]);
		 * console.log(parent); // <p><strong>1</strong><strong>3</strong></p>
		 * ```
		 */
		setChildrenInPlace(children: Node[]): void;
		/**
		 * Appends a text node to the node.
		 * @param val The text.
		 * @example
		 * ```ts
		 * const parent = createEl('p');
		 * parent.createEl('strong', { text: 'foo' });
		 * parent.appendText('bar');
		 * console.log(parent); // <p><strong>foo</strong>bar</p>
		 * ```
		 */
		appendText(val: string): void;
		/**
		 * Cross-window capable instanceof check, a drop-in replacement
		 * for instanceof checks on DOM Nodes. Remember to also check
		 * for nulls when necessary.
		 * @param type The type.
		 * @example
		 * ```ts
		 * const node = createEl('p');
		 * console.log(node.instanceOf(HTMLParagraphElement)); // true
		 * console.log(node.instanceOf(HTMLSpanElement)); // false
		 * ```
		 */
		instanceOf<T>(type: { new (): T }): this is T;
		/**
		 * The document this node belongs to, or the global document.
		 */
		doc: Document;
		/**
		 * The window object this node belongs to, or the global window.
		 */
		win: Window;
		/**
		 * The window whose constructors were used to create this node.
		 * Usually the same as `win`, but can differ after the node is moved to another window.
		 */
		constructorWin: Window;
	}
	interface Element extends Node {
		/**
		 * Returns the text content of the element.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.createEl('strong', { text: 'foo' });
		 * element.createEl('strong', { text: 'bar' });
		 * console.log(element.getText()); // foobar
		 * ```
		 */
		getText(): string;
		/**
		 * Sets the text content of the element.
		 * @param val The text, or a node to replace the content with.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.setText('foo');
		 * console.log(element); // <p>foo</p>
		 * const fragment = createFragment();
		 * fragment.createEl('strong', { text: 'bar' });
		 * element.setText(fragment);
		 * console.log(element); // <p><strong>bar</strong></p>
		 * ```
		 */
		setText(val: string | DocumentFragment): void;
		/**
		 * Adds one or more classes to the element.
		 * @param classes The classes.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * console.log(element.className); // foo bar
		 * ```
		 */
		addClass(...classes: string[]): void;
		/**
		 * Adds multiple classes to the element.
		 * @param classes The classes.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClasses(['foo', 'bar']);
		 * console.log(element.className); // foo bar
		 * ```
		 */
		addClasses(classes: string[]): void;
		/**
		 * Removes one or more classes from the element.
		 * @param classes The classes.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * element.removeClass('foo', 'baz');
		 * console.log(element.className); // bar
		 * ```
		 */
		removeClass(...classes: string[]): void;
		/**
		 * Removes multiple classes from the element.
		 * @param classes The classes.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * element.removeClasses(['foo', 'baz']);
		 * console.log(element.className); // bar
		 * ```
		 */
		removeClasses(classes: string[]): void;
		/**
		 * Adds or removes one or more classes on the element.
		 * @param classes The class or classes.
		 * @param value If `true`, the classes will be added. If `false`, they will be removed.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * element.toggleClass('foo', false);
		 * console.log(element.className); // bar
		 * element.toggleClass('foo', true);
		 * console.log(element.className); // bar foo
		 * element.toggleClass('baz', false);
		 * console.log(element.className); // bar foo
		 * element.toggleClass('baz', true);
		 * console.log(element.className); // bar foo baz
		 * ```
		 */
		toggleClass(classes: string | string[], value: boolean): void;
		/**
		 * Checks if the element has a class.
		 * @param cls The class.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.addClass('foo', 'bar');
		 * console.log(element.hasClass('foo')); // true
		 * console.log(element.hasClass('baz')); // false
		 * ```
		 */
		hasClass(cls: string): boolean;
		/**
		 * Sets an attribute on the element.
		 * @param qualifiedName The attribute name.
		 * @param value The value, or `null` to remove the attribute.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.setAttr('data-foo', 'bar');
		 * console.log(element.getAttr('data-foo')); // bar
		 * ```
		 */
		setAttr(qualifiedName: string, value: string | number | boolean | null): void;
		/**
		 * Sets multiple attributes on the element.
		 * @param obj The attributes. A `null` value removes the attribute.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.setAttrs({
		 *     'data-foo': 'bar',
		 *     'data-baz': 'qux',
		 * });
		 * console.log(element.getAttr('data-foo')); // bar
		 * console.log(element.getAttr('data-baz')); // qux
		 * ```
		 */
		setAttrs(obj: { [key: string]: string | number | boolean | null }): void;
		/**
		 * Gets an attribute from the element.
		 * @param qualifiedName The attribute name.
		 * @returns The value, or `null` if the element does not have the attribute.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.setAttr('data-foo', 'bar');
		 * console.log(element.getAttr('data-foo')); // bar
		 * ```
		 */
		getAttr(qualifiedName: string): string | null;
		/**
		 * Returns the closest element that matches the selector, starting with this element and walking up the DOM tree.
		 * @param selector The selector.
		 * @param lastParent The ancestor to stop at. It is still checked against the selector.
		 * @returns The matching element, or `null` if none is found.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * console.log(element.matchParent('p')); // <p></p>
		 * console.log(element.matchParent('strong')); // null
		 * const child = element.createEl('strong');
		 * console.log(child.matchParent('strong')); // <strong></strong>
		 * console.log(child.matchParent('p')); // <p></p>
		 * const grandchild = child.createEl('em');
		 * console.log(grandchild.matchParent('p', child)); // null
		 * ```
		 */
		matchParent(selector: string, lastParent?: Element): Element | null;
		/**
		 * Gets the computed value of a CSS property of the element.
		 * @param property The CSS property.
		 * @param pseudoElement The pseudo-element, e.g. `'::after'`.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * element.style.color = 'red';
		 * console.log(element.getCssPropertyValue('color')); // rgb(255, 0, 0)
		 * console.log(element.getCssPropertyValue('color', ':after')); // rgb(255, 0, 0)
		 * ```
		 */
		getCssPropertyValue(property: string, pseudoElement?: string): string;
		/**
		 * Checks if the element is focused, taking iframes and the active window into account.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * console.log(element.isActiveElement()); // false
		 * console.log(document.activeElement?.isActiveElement()); // true
		 * ```
		 */
		isActiveElement(): boolean;
	}
	interface HTMLElement extends Element {
		/**
		 * Shows the element by restoring its CSS `display` property, if it was hidden with `hide()`.
		 */
		show(): void;
		/**
		 * Hides the element by setting its CSS `display` property to `none`.
		 */
		hide(): void;
		/**
		 * Shows or hides the element using its CSS `display` property.
		 * @param show Whether to show the element.
		 * @example
		 * ```ts
		 * document.body.toggle(true);
		 * document.body.toggle(false);
		 * ```
		 */
		toggle(show: boolean): void;
		/**
		 * Shows or hides the element using its CSS `visibility` property.
		 * @param visible Whether to show the element.
		 * @example
		 * ```ts
		 * document.body.toggleVisibility(true);
		 * document.body.toggleVisibility(false);
		 * ```
		 */
		toggleVisibility(visible: boolean): void;
		/**
		 * Returns whether this element is shown, when the element is attached to the DOM and
		 * none of the parent and ancestor elements are hidden with `display: none`.
		 *
		 * Exception: Does not work on `<body>` and `<html>`, or on elements with `position: fixed`.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * console.log(element.isShown()); // true
		 * element.hide();
		 * console.log(element.isShown()); // false
		 * ```
		 */
		isShown(): boolean;
		/**
		 * Sets the CSS styles of the element.
		 * @param styles The styles.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * element.setCssStyles({ color: 'red', fontSize: '16px' });
		 * ```
		 */
		setCssStyles(styles: Partial<CSSStyleDeclaration>): void;
		/**
		 * Sets the CSS properties of the element.
		 * @param props The CSS properties.
		 * @example
		 * ```ts
		 * const element = document.body.createEl('p');
		 * element.setCssProps({ color: 'red', 'font-size': '16px' });
		 * ```
		 */
		setCssProps(props: Record<string, string>): void;
		/**
		 * Get the inner width of this element without padding.
		 */
		readonly innerWidth: number;
		/**
		 * Get the inner height of this element without padding.
		 */
		readonly innerHeight: number;
	}
	interface SVGElement extends Element {
		/**
		 * Sets the CSS styles of the element.
		 * @param styles The styles.
		 * @example
		 * ```ts
		 * const element = document.body.createSvg('svg');
		 * element.setCssStyles({ color: 'red', fontSize: '16px' });
		 * ```
		 */
		setCssStyles(styles: Partial<CSSStyleDeclaration>): void;
		/**
		 * Sets the CSS properties of the element.
		 * @param props The CSS properties.
		 * @example
		 * ```ts
		 * const element = document.body.createSvg('svg');
		 * element.setCssProps({ color: 'red', 'font-size': '16px' });
		 * ```
		 */
		setCssProps(props: Record<string, string>): void;
	}
	/**
	 * Checks if a value is a boolean.
	 * @param obj The value.
	 * @example
	 * ```ts
	 * console.log(isBoolean(false)); // true
	 * console.log(isBoolean('not a boolean')); // false
	 * ```
	 */
	function isBoolean(obj: any): obj is boolean;
	/**
	 * Finds the first element in the document that matches the selector, or `null` if none match.
	 * @param selector The CSS selector.
	 * @example
	 * ```ts
	 * const element = document.body.createEl('p');
	 * element.createEl('strong', { cls: 'foo' });
	 * console.log(fish('.foo')); // <strong class="foo"></strong>
	 * console.log(fish('.bar')); // null
	 * ```
	 */
	function fish(selector: string): HTMLElement | null;
	/**
	 * Finds all elements in the document that match the selector.
	 * @param selector The CSS selector.
	 * @example
	 * ```ts
	 * const element = document.body.createEl('p');
	 * element.createEl('strong', { cls: 'foo' });
	 * element.createEl('strong', { cls: 'foo' });
	 * console.log(fishAll('.foo')); // [<strong class="foo"></strong>, <strong class="foo"></strong>]
	 * console.log(fishAll('.bar')); // []
	 * ```
	 */
	function fishAll(selector: string): HTMLElement[];
	interface Element extends Node {
		/**
		 * Finds the first descendant element that matches the selector, or `null` if none match.
		 * @param selector The CSS selector.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.createEl('strong', { cls: 'foo' });
		 * console.log(element.find('.foo')); // <strong class="foo"></strong>
		 * console.log(element.find('.bar')); // null
		 * ```
		 */
		find(selector: string): Element | null;
		/**
		 * Finds all descendant elements that match the selector.
		 * @param selector The CSS selector.
		 * @example
		 * ```ts
		 * const element = createEl('p');
		 * element.createEl('strong', { cls: 'foo' });
		 * element.createEl('strong', { cls: 'foo' });
		 * console.log(element.findAll('.foo')); // [<strong class="foo"></strong>, <strong class="foo"></strong>]
		 * console.log(element.findAll('.bar')); // []
		 * ```
		 * @remarks See bug {@link https://forum.obsidian.md/t/bug-find-findall-findallself/98108}.
		 */
		findAll(selector: string): HTMLElement[];
		/**
		 * Finds this element and all descendant elements that match the selector.
		 * @param selector The CSS selector.
		 * @returns The matching elements, starting with this element if it matches.
		 * @example
		 * ```ts
		 * const element = createEl('p', { cls: 'foo' });
		 * element.createEl('strong', { cls: 'foo' });
		 * console.log(element.findAllSelf('.foo')); // [<p class="foo"></p>, <strong class="foo"></strong>]
		 * console.log(element.findAllSelf('.bar')); // []
		 * ```
		 * @remarks See bug {@link https://forum.obsidian.md/t/bug-find-findall-findallself/98108}.
		 */
		findAllSelf(selector: string): HTMLElement[];
	}
	interface HTMLElement extends Element {
		find(selector: string): HTMLElement;
		findAll(selector: string): HTMLElement[];
		findAllSelf(selector: string): HTMLElement[];
	}
	interface DocumentFragment extends Node, NonElementParentNode, ParentNode {
		/**
		 * Finds the first descendant element that matches the selector, or `null` if none match.
		 * @param selector The CSS selector.
		 * @example
		 * ```ts
		 * const fragment = createFragment();
		 * fragment.createEl('strong', { cls: 'foo' });
		 * console.log(fragment.find('.foo')); // <strong class="foo"></strong>
		 * console.log(fragment.find('.bar')); // null
		 * ```
		 * @remarks See bug {@link https://forum.obsidian.md/t/bug-find-findall-findallself/98108}.
		 */
		find(selector: string): HTMLElement | null;
		/**
		 * Finds all descendant elements that match the selector.
		 * @param selector The CSS selector.
		 * @example
		 * ```ts
		 * const fragment = createFragment();
		 * fragment.createEl('strong', { cls: 'foo' });
		 * fragment.createEl('strong', { cls: 'foo' });
		 * console.log(fragment.findAll('.foo')); // [<strong class="foo"></strong>, <strong class="foo"></strong>]
		 * console.log(fragment.findAll('.bar')); // []
		 * ```
		 * @remarks See bug {@link https://forum.obsidian.md/t/bug-find-findall-findallself/98108}.
		 */
		findAll(selector: string): HTMLElement[];
	}
	/**
	 * Options object passed to {@link createEl}.
	 */
	interface DomElementInfo {
		/**
		 * The class to be assigned. Can be a space-separated string or an array of strings.
		 * @example
		 * ```ts
		 * createEl('p', { cls: 'foo bar' });
		 * createEl('p', { cls: ['foo', 'bar'] });
		 * ```
		 */
		cls?: string | string[];
		/**
		 * The textContent to be assigned.
		 * @example
		 * ```ts
		 * createEl('p', { text: 'foo' });
		 * const fragment = createFragment();
		 * fragment.createEl('strong', { text: 'bar' });
		 * createEl('p', { text: fragment });
		 * ```
		 */
		text?: string | DocumentFragment;
		/**
		 * HTML attributes to be added.
		 */
		attr?: {
			[key: string]: string | number | boolean | null;
		};
		/**
		 * HTML title (for hover tooltip).
		 */
		title?: string;
		/**
		 * The parent element to be assigned to.
		 */
		parent?: Node;
		/**
		 * Only applies to `<input>`, `<select>`, and `<option>` elements.
		 */
		value?: string;
		/**
		 * Only applies to `<input>` and `<style>` elements.
		 */
		type?: string;
		/**
		 * Whether to insert the element as the first child of the parent, instead of the last.
		 */
		prepend?: boolean;
		/**
		 * Only applies to `<input>` elements.
		 */
		placeholder?: string;
		/**
		 * Only applies to `<a>`, `<link>`, and `<base>` elements.
		 */
		href?: string;
	}
	/**
	 * Options object passed to {@link createSvg}.
	 */
	interface SvgElementInfo {
		/**
		 * The class to be assigned. Can be a space-separated string or an array of strings.
		 * @example
		 * ```ts
		 * createSvg('svg', { cls: 'foo bar' });
		 * createSvg('svg', { cls: ['foo', 'bar'] });
		 * ```
		 */
		cls?: string | string[];
		/**
		 * HTML attributes to be added.
		 */
		attr?: {
			[key: string]: string | number | boolean | null;
		};
		/**
		 * The parent element to be assigned to.
		 */
		parent?: Node;
		/**
		 * Whether to insert the element as the first child of the parent, instead of the last.
		 */
		prepend?: boolean;
	}
	interface Node {
		/**
		 * Create an element and append it to this node.
		 * @param tag The tag name.
		 * @param o The options, or a CSS class to add.
		 * @param callback Called with the new element before it is appended.
		 * @example
		 * ```ts
		 * document.body.createEl('p', { text: 'foo' }, (p) => {
		 *     p.createEl('strong', { text: 'bar' });
		 * });
		 * ```
		 */
		createEl<K extends keyof HTMLElementTagNameMap>(
			tag: K,
			o?: DomElementInfo | string,
			callback?: (el: HTMLElementTagNameMap[K]) => void,
		): HTMLElementTagNameMap[K];
		/**
		 * Create a `<div>` element and append it to this node.
		 * @param o The options, or a CSS class to add.
		 * @param callback Called with the new element before it is appended.
		 * @example
		 * ```ts
		 * document.body.createDiv({ text: 'foo' }, (div) => {
		 *     div.createEl('strong', { text: 'bar' });
		 * });
		 * ```
		 */
		createDiv(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void): HTMLDivElement;
		/**
		 * Create a `<span>` element and append it to this node.
		 * @param o The options, or a CSS class to add.
		 * @param callback Called with the new element before it is appended.
		 * @example
		 * ```ts
		 * document.body.createSpan({ text: 'foo' }, (span) => {
		 *     span.createEl('strong', { text: 'bar' });
		 * });
		 * ```
		 */
		createSpan(o?: DomElementInfo | string, callback?: (el: HTMLSpanElement) => void): HTMLSpanElement;
		/**
		 * Create an SVG element such as `<svg>`, `<circle>` or `<rect>` and append it to this node.
		 * @param tag The tag name.
		 * @param o The options, or a CSS class to add.
		 * @param callback Called with the new element before it is appended.
		 * @example
		 * ```ts
		 * document.body.createSvg('svg', { cls: 'foo bar' }, (svg) => {
		 *     svg.createSvg('circle');
		 * });
		 * ```
		 */
		createSvg<K extends keyof SVGElementTagNameMap>(
			tag: K,
			o?: SvgElementInfo | string,
			callback?: (el: SVGElementTagNameMap[K]) => void,
		): SVGElementTagNameMap[K];
	}
	/**
	 * Creates a new element.
	 * @param tag The tag name.
	 * @param o The options, or a CSS class to add.
	 * @param callback Called with the new element before it is appended to the parent.
	 * @example
	 * ```ts
	 * createEl('p', { text: 'foo' }, (p) => {
	 *     p.createEl('strong', { text: 'bar' });
	 * });
	 * ```
	 */
	function createEl<K extends keyof HTMLElementTagNameMap>(
		tag: K,
		o?: DomElementInfo | string,
		callback?: (el: HTMLElementTagNameMap[K]) => void,
	): HTMLElementTagNameMap[K];
	/**
	 * Creates a new `<div>` element.
	 * @param o The options, or a CSS class to add.
	 * @param callback Called with the new element before it is appended to the parent.
	 * @example
	 * ```ts
	 * createDiv({ text: 'foo' }, (div) => {
	 *     div.createEl('strong', { text: 'bar' });
	 * });
	 * ```
	 */
	function createDiv(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void): HTMLDivElement;
	/**
	 * Creates a new `<span>` element.
	 * @param o The options, or a CSS class to add.
	 * @param callback Called with the new element before it is appended to the parent.
	 * @example
	 * ```ts
	 * createSpan({ text: 'foo' }, (span) => {
	 *     span.createEl('strong', { text: 'bar' });
	 * });
	 * ```
	 */
	function createSpan(o?: DomElementInfo | string, callback?: (el: HTMLSpanElement) => void): HTMLSpanElement;
	/**
	 * Creates a new SVG element such as `<svg>`, `<circle>` or `<rect>`.
	 * @param tag The tag name.
	 * @param o The options, or a CSS class to add.
	 * @param callback Called with the new element before it is appended to the parent.
	 * @example
	 * ```ts
	 * createSvg('svg', { cls: 'foo bar' }, (svg) => {
	 *     svg.createSvg('circle');
	 * });
	 * ```
	 */
	function createSvg<K extends keyof SVGElementTagNameMap>(
		tag: K,
		o?: SvgElementInfo | string,
		callback?: (el: SVGElementTagNameMap[K]) => void,
	): SVGElementTagNameMap[K];
	/**
	 * Creates a new document fragment.
	 * @param callback Called with the new fragment.
	 * @example
	 * ```ts
	 * createFragment((fragment) => {
	 *     fragment.createEl('p', { text: 'foo' });
	 * });
	 * ```
	 */
	function createFragment(callback?: (el: DocumentFragment) => void): DocumentFragment;
	/**
	 * Information about a delegated event listener added with `on()`.
	 */
	interface EventListenerInfo {
		/**
		 * The selector that the event target, or one of its ancestors, must match.
		 */
		selector: string;
		/**
		 * The listener passed to `on()`.
		 */
		listener: Function;
		/**
		 * The options passed to `on()`.
		 */
		options?: boolean | AddEventListenerOptions;
		/**
		 * The wrapper function registered with `addEventListener`, which calls the listener when the selector matches.
		 */
		callback: Function;
	}
	interface HTMLElement extends Element {
		/**
		 * The delegated event listeners added to the element with `on()`, grouped by event type.
		 */
		_EVENTS?: {
			[K in keyof HTMLElementEventMap]?: EventListenerInfo[];
		};
		/**
		 * Adds a delegated event listener to the element. The listener is called when the event target,
		 * or one of its ancestors, matches the selector.
		 * @param type The event type.
		 * @param selector The CSS selector.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 */
		on<K extends keyof HTMLElementEventMap>(
			this: HTMLElement,
			type: K,
			selector: string,
			listener: (this: HTMLElement, ev: HTMLElementEventMap[K], delegateTarget: HTMLElement) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
		/**
		 * Removes a delegated event listener that was added with `on()`.
		 * The arguments must match the ones that were passed to `on()`.
		 * @param type The event type.
		 * @param selector The CSS selector.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 * @example
		 * ```ts
		 * const listener = (ev: MouseEvent) => console.log(ev);
		 * document.body.on('click', 'div', listener);
		 * document.body.off('click', 'div', listener);
		 * ```
		 */
		off<K extends keyof HTMLElementEventMap>(
			this: HTMLElement,
			type: K,
			selector: string,
			listener: (this: HTMLElement, ev: HTMLElementEventMap[K], delegateTarget: HTMLElement) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
		/**
		 * Adds a listener for both `click` and `auxclick` (e.g. middle click) events to the element.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 */
		onClickEvent(
			this: HTMLElement,
			listener: (this: HTMLElement, ev: MouseEvent) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
		/**
		 * Registers a callback to be called when this element is inserted into the DOM.
		 * @param listener The callback.
		 * @param once If `true`, this will only fire once and then unhook itself.
		 * @returns A function that unregisters the callback, to avoid memory leaks.
		 */
		onNodeInserted(this: HTMLElement, listener: () => any, once?: boolean): () => void;
		/**
		 * Registers a callback to be called when this element is moved to another window.
		 * @param listener The callback, called with the new window.
		 * @returns A function that unregisters the callback, to avoid memory leaks.
		 */
		onWindowMigrated(this: HTMLElement, listener: (win: Window) => any): () => void;
		/**
		 * Dispatches a bubbling event of the given type on the element.
		 * @param eventType The event type.
		 */
		trigger(eventType: string): void;
	}
	interface Document {
		/**
		 * The delegated event listeners added to the document with `on()`, grouped by event type.
		 */
		_EVENTS?: {
			[K in keyof DocumentEventMap]?: EventListenerInfo[];
		};
		/**
		 * Adds a delegated event listener to the document. The listener is called when the event target,
		 * or one of its ancestors, matches the selector.
		 * @param type The event type.
		 * @param selector The CSS selector.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 */
		on<K extends keyof DocumentEventMap>(
			this: Document,
			type: K,
			selector: string,
			listener: (this: Document, ev: DocumentEventMap[K], delegateTarget: HTMLElement) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
		/**
		 * Removes a delegated event listener that was added with `on()`.
		 * The arguments must match the ones that were passed to `on()`.
		 * @param type The event type.
		 * @param selector The CSS selector.
		 * @param listener The listener.
		 * @param options The `addEventListener` options.
		 * @example
		 * ```ts
		 * const listener = (ev: MouseEvent) => console.log(ev);
		 * document.on('click', 'div', listener);
		 * document.off('click', 'div', listener);
		 * ```
		 */
		off<K extends keyof DocumentEventMap>(
			this: Document,
			type: K,
			selector: string,
			listener: (this: Document, ev: DocumentEventMap[K], delegateTarget: HTMLElement) => any,
			options?: boolean | AddEventListenerOptions,
		): void;
	}
	interface UIEvent extends Event {
		/**
		 * The target node of the event.
		 */
		targetNode: Node | null;
		/**
		 * The window in which the event occurred.
		 */
		win: Window;
		/**
		 * The document in which the event occurred.
		 */
		doc: Document;
		/**
		 * Cross-window capable instanceof check, a drop-in replacement
		 * for instanceof checks on UIEvents.
		 * @param type The type.
		 * @example
		 * ```ts
		 * if (event.instanceOf(MouseEvent)) {
		 *     console.log('event is a mouse event');
		 * }
		 * ```
		 */
		instanceOf<T>(type: { new (...data: any[]): T }): this is T;
	}
	/**
	 * Options for an {@link ajax} request.
	 */
	interface AjaxOptions {
		/**
		 * The HTTP method. Defaults to `'GET'`.
		 */
		method?: "GET" | "POST";
		/**
		 * The request URL.
		 */
		url: string;
		/**
		 * Called when the request completes with a status code from 200 to 399.
		 */
		success?: (response: any, req: XMLHttpRequest) => any;
		/**
		 * Called when the request fails or completes with any other status code.
		 */
		error?: (error: any, req: XMLHttpRequest) => any;
		/**
		 * The request body. Objects are sent as JSON.
		 */
		data?: object | string | ArrayBuffer;
		/**
		 * The request headers.
		 */
		headers?: Record<string, string>;
		/**
		 * Whether to send credentials.
		 * Defaults to `true` if `data` is set, `false` otherwise.
		 */
		withCredentials?: boolean;
		/**
		 * Set to the underlying `XMLHttpRequest` once the request is sent.
		 */
		req?: XMLHttpRequest;
	}
	/**
	 * Sends an AJAX request.
	 * @param options The request options.
	 * @example
	 * ```ts
	 * ajax({
	 *     url: 'https://example.com',
	 *     success: (response) => {
	 *         console.log(response);
	 *     },
	 *     error: (error) => {
	 *         console.error(error);
	 *     }
	 * });
	 * ```
	 */
	function ajax(options: AjaxOptions): void;
	/**
	 * Sends an AJAX request.
	 * @param options The request options.
	 * @returns The response. Rejects with the `XMLHttpRequest` if the request fails.
	 * @example
	 * ```ts
	 * const response = await ajaxPromise({ url: 'https://example.com' });
	 * console.log(response);
	 * ```
	 */
	function ajaxPromise(options: AjaxOptions): Promise<any>;
	/**
	 * Executes a function when the DOM is ready, or immediately if it already is.
	 * @param fn The function.
	 */
	function ready(fn: () => any): void;
	/**
	 * Sleeps for a given number of milliseconds.
	 * @param ms The number of milliseconds.
	 */
	function sleep(ms: number): Promise<void>;
	/**
	 * Waits for the next animation frame.
	 */
	function nextFrame(): Promise<void>;
	/**
	 * The actively focused Window object. This is usually the same as `window` but
	 * it will be different when using popout windows.
	 */
	let activeWindow: Window;
	/**
	 * The actively focused Document object. This is usually the same as `document` but
	 * it will be different when using popout windows.
	 */
	let activeDocument: Document;
	interface Window
		extends EventTarget,
			AnimationFrameProvider,
			GlobalEventHandlers,
			WindowEventHandlers,
			WindowLocalStorage,
			WindowOrWorkerGlobalScope,
			WindowSessionStorage {
		/**
		 * The actively focused Window object. This is usually the same as `window` but
		 * it will be different when using popout windows.
		 */
		activeWindow: Window;
		/**
		 * The actively focused Document object. This is usually the same as `document` but
		 * it will be different when using popout windows.
		 */
		activeDocument: Document;
		/**
		 * Sleeps for a given number of milliseconds.
		 * @param ms The number of milliseconds.
		 */
		sleep(ms: number): Promise<void>;
		/**
		 * Waits for the next animation frame.
		 * @returns A promise that resolves on the next animation frame.
		 */
		nextFrame(): Promise<void>;
	}
	interface Touch {
		/**
		 * The type of touch.
		 */
		touchType: "stylus" | "direct";
	}
}
