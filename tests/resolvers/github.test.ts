import { afterEach, expect, test, vi} from 'vitest';

import { github } from '../../src/resolvers/github.js';

afterEach(() => {
	// Safely removes the spy and puts back native fetch
	vi.restoreAllMocks();
});

const SOURCE = `console.log("Hello, world!");`;

test('should return text from fetch', async () => {
	const mockResponse = new Response(SOURCE, {
		headers: { 'Content-Type': 'text/plain' },
	});
	vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

	const source = await github()('user/repo/path/to/source.js');

	expect(source).toBe(SOURCE);
});

test('should return null if fetch returns non-200', async () => {
	const mockResponse = new Response('Not Found', { status: 404 });
	vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
	const spiedConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

	const path = 'user/repo/path/to/source.js';
	expect(await github()(path)).toBeNull();
	expect(spiedConsoleError).toHaveBeenCalledWith(
		`[remark-codeblock-source] Error fetching from GitHub: 404 `,
	);
});

test('should return null if fetch throws', async () => {
	const mockError = new Error('Network error');
	vi.spyOn(global, 'fetch').mockRejectedValue(mockError);
	const spiedConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

	const path = 'user/repo/path/to/source.js';
	expect(await github()(path)).toBeNull();
	expect(spiedConsoleError).toHaveBeenCalledWith(
		`[remark-codeblock-source] Error fetching from GitHub: ${mockError}`,
	);
});

test('cache should take effect if turned on', async () => {
	const mockResponse = new Response(SOURCE, {
		headers: { 'Content-Type': 'text/plain' },
	});

	const mockedFetch = vi.fn().mockResolvedValue(mockResponse);

	const path = 'user/repo/path/to/source.js';
	expect(await github({ cache: true, fetch: mockedFetch })(path)).toBe(SOURCE);
	expect(await github({ cache: true, fetch: mockedFetch })(path)).toBe(SOURCE);

	expect(mockedFetch).toHaveBeenCalledTimes(1);
});
