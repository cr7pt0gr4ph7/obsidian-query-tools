import assert from "node:assert/strict";
import http from "node:http";
import { suite, test } from "node:test";
import { request, requestUrl } from "../../../../src/host/obsidian/base/request.ts";

suite("Web request utilities", () => {
	async function withServer(
		handler: (request: http.IncomingMessage, response: http.ServerResponse) => void,
		run: (url: string) => Promise<void>,
	): Promise<void> {
		const server = http.createServer(handler);
		await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
		const address = server.address();
		assert.ok(address && typeof address !== "string");
		try {
			await run(`http://127.0.0.1:${address.port}`);
		} finally {
			await new Promise<void>((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
			});
		}
	}

	test("request and requestUrl read GET response bodies", async () => {
		await withServer(
			(_request, response) => {
				response.writeHead(200, { "Content-Type": "text/plain" });
				response.end("hello");
			},
			async (url) => {
				assert.equal(await request(url), "hello");
				const response = await requestUrl(url);
				assert.equal(response.status, 200);
				assert.equal(response.text, "hello");
				assert.equal(response.headers["content-type"], "text/plain");
				assert.equal(new TextDecoder().decode(response.arrayBuffer), "hello");
				assert.equal(await requestUrl(url).text, "hello");
			},
		);
	});

	test("requestUrl posts JSON and parses response JSON", async () => {
		await withServer(
			(incoming, response) => {
				let body = "";
				incoming.setEncoding("utf8");
				incoming.on("data", (chunk) => (body += chunk));
				incoming.on("end", () => {
					assert.equal(incoming.method, "POST");
					assert.equal(incoming.headers["content-type"], "application/json");
					assert.deepEqual(JSON.parse(body), { value: 42 });
					response.writeHead(201, { "Content-Type": "application/json" });
					response.end(JSON.stringify({ ok: true }));
				});
			},
			async (url) => {
				const response = requestUrl({
					url,
					method: "POST",
					contentType: "application/json",
					body: JSON.stringify({ value: 42 }),
				});
				assert.deepEqual(await response.json, { ok: true });
				const resolved = await response;
				assert.equal(resolved.status, 201);
				assert.deepEqual(resolved.json, { ok: true });
			},
		);
	});

	test("requestUrl throws for errors by default and can disable throwing", async () => {
		await withServer(
			(_request, response) => {
				response.writeHead(418);
				response.end("teapot");
			},
			async (url) => {
				await assert.rejects(requestUrl(url), /status 418/);
				assert.equal((await requestUrl({ url, throw: false })).status, 418);
			},
		);
	});
});
