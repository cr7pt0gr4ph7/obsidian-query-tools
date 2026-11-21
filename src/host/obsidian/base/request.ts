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
	return requestUrl(request).text;
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
 * @returns The URL response.
 * @public
 */
export function requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise {
	const params: RequestUrlParam = typeof request === "string" ? { url: request } : request;
	const promise = (async (): Promise<RequestUrlResponse> => {
		const headers = new Headers(params.headers);
		if (params.contentType && !headers.has("content-type")) {
			headers.set("content-type", params.contentType);
		}
		const body =
			params.body === undefined
				? undefined
				: typeof params.body === "string"
					? params.body
					: new Uint8Array(params.body);
		const response = await fetch(params.url, {
			method: params.method,
			headers,
			body,
		});
		const bytes = await response.arrayBuffer();
		const text = new TextDecoder().decode(bytes);
		const responseHeaders: Record<string, string> = {};
		response.headers.forEach((value, key) => {
			responseHeaders[key] = value;
		});
		if (params.throw !== false && response.status >= 400) {
			throw new Error(`Request failed with status ${response.status}: ${text}`);
		}
		let json: unknown = null;
		try {
			json = JSON.parse(text);
		} catch {
			// Non-JSON responses remain available through text and arrayBuffer.
		}
		return {
			status: response.status,
			headers: responseHeaders,
			arrayBuffer: bytes,
			json,
			text,
		};
	})();
	Object.defineProperties(promise, {
		arrayBuffer: { enumerable: true, get: () => promise.then((response) => response.arrayBuffer) },
		json: { enumerable: true, get: () => promise.then((response) => response.json) },
		text: { enumerable: true, get: () => promise.then((response) => response.text) },
	});
	return promise as RequestUrlResponsePromise;
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
