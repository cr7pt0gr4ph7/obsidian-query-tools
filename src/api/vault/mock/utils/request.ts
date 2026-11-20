/**
 * Similar to {@link fetch}, request a URL using HTTP/HTTPS, without any CORS restrictions.
 * @param request The request parameters, or the URL to request.
 * @returns The response body as a string.
 * @example
 * ```ts
 * console.log(await request({ url: 'https://google.com' }));
 * console.log(await request('https://google.com'));
 * ```
 * @public
 * @since 0.12.11
 */
export function request(request: RequestUrlParam | string): Promise<string> {
	throw new Error("Method not implemented.");
}

/**
 * Similar to {@link fetch}, request a URL using HTTP/HTTPS, without any CORS restrictions.
 * @param request The request parameters, or the URL to request.
 * @example
 * ```ts
 * const response = requestUrl({ url: 'https://google.com' });
 * console.log(await response);
 * console.log(await response.arrayBuffer);
 * console.log(await response.json);
 * console.log(await response.text);
 * console.log(await requestUrl('https://google.com'));
 * ```
 * @public
 */
export function requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise {
	throw new Error("Method not implemented.");
}

/**
 * The parameters for the {@link requestUrl} function.
 * @public
 */
export interface RequestUrlParam {
	/**
	 * The URL.
	 * @example https://obsidian.md
	 * @public
	 */
	url: string;
	/**
	 * The HTTP method.
	 * @example 'GET'
	 * @example 'POST'
	 * @public
	 */
	method?: string;
	/**
	 * The content type.
	 * @example 'application/json'
	 * @public
	 */
	contentType?: string;
	/**
	 * The request body.
	 * @example
	 * ```ts
	 * 'foo'
	 * new Uint8Array([1, 2, 3]).buffer
	 * ```
	 * @public
	 */
	body?: string | ArrayBuffer;
	/**
	 * The request headers.
	 * @example
	 * ```ts
	 * { 'Content-Type': 'application/json' }
	 * ```
	 * @public
	 */
	headers?: Record<string, string>;
	/**
	 * Whether to throw an error when the status code is 400+.
	 * Defaults to `true`.
	 * @public
	 */
	throw?: boolean;
}

/**
 * The response from the {@link requestUrl} function.
 * @public
 */
export interface RequestUrlResponse {
	/**
	 * The status code.
	 * @example 200
	 * @public
	 */
	status: number;
	/**
	 * The response headers.
	 * @example
	 * ```ts
	 * { 'Content-Type': 'application/json' }
	 * ```
	 * @public
	 */
	headers: Record<string, string>;
	/**
	 * The body as an `ArrayBuffer`.
	 * @public
	 */
	arrayBuffer: ArrayBuffer;
	/**
	 * The body, parsed as JSON.
	 * @public
	 */
	json: any;
	/**
	 * The body as a string.
	 * @public
	 */
	text: string;
}

/**
 * The promise returned by the {@link requestUrl} function, with shortcuts to the body of the response.
 * @public
 */
export interface RequestUrlResponsePromise extends Promise<RequestUrlResponse> {
	/**
	 * The body as an `ArrayBuffer`.
	 * @public
	 */
	arrayBuffer: Promise<ArrayBuffer>;
	/**
	 * The body, parsed as JSON.
	 * @public
	 */
	json: Promise<any>;
	/**
	 * The body as a string.
	 * @public
	 */
	text: Promise<string>;
}
