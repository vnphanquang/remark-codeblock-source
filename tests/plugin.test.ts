import { vol } from 'memfs';
import { VFile } from 'vfile';
import { describe, expect, test, vi } from 'vitest';

import { fs, github } from '../src/resolvers';

import { html, markdown, matchStringIgnoringWhitespace, processWithPlugin } from './test-utils';

// tell vitest to use fs mock from __mocks__ folder
vi.mock('node:fs');
vi.mock('node:fs/promises');

const SOURCE = `console.log("Hello, world!");`;
const EXPECTED_OUTPUT = html`
	<pre><code class="language-js"> ${SOURCE} </code></pre>
`;

test('should skip code blocks without src attribute', async () => {
	const output = await processWithPlugin(markdown`
		~~~js
		${SOURCE};
		~~~
	`);
	matchStringIgnoringWhitespace(
		output,
		html`
		<pre><code class="language-js">${SOURCE}; </code></pre>
	`,
	);
});

test('should skip if no matching resolver', async () => {
	const output = await processWithPlugin(markdown`
		~~~js src="unknown:./examples/test.js"

		~~~
	`);
	matchStringIgnoringWhitespace(output, html`
		<pre><code class="language-js"> </code></pre>
	`);
});

test('should skip if resolver does not return content', async () => {
	const output = await processWithPlugin(
		markdown`
			~~~js src="custom:./examples/test.js"

			~~~
		`,
		{
			resolvers: {
				custom: () => null,
			},
		},
	);
	matchStringIgnoringWhitespace(output, html`
		<pre><code class="language-js"> </code></pre>
	`);
});

describe('should process code blocks with src attribute', async () => {
	test('with fs resolver', async () => {
		// setup virtual file system
		vol.fromJSON({
			'/project/examples/test.js': SOURCE,
		});

		// spy on the fs resolver to ensure it is called with the correct arguments
		const resolvers = {
			fs: fs(),
		};
		const spiedOnFsResolver = vi.spyOn(resolvers, 'fs');

		// create a VFile
		const vfile = new VFile({
			path: '/project/index.md',
			value: markdown`
				~~~js src="fs:./examples/test.js"

				~~~
			`,
		});

		const output = await processWithPlugin(new VFile(vfile), { resolvers });
		matchStringIgnoringWhitespace(output, EXPECTED_OUTPUT);

		expect(spiedOnFsResolver).toHaveBeenCalledWith(
			'./examples/test.js',
			expect.objectContaining({
				history: [vfile.path],
			}),
			expect.objectContaining({
				type: 'code',
				lang: 'js',
				meta: 'src="fs:./examples/test.js"',
			}),
		);

		// cleanup
		vol.reset();
	});

	test('with github resolver', async () => {
		const mockResponse = new Response(SOURCE, {
			headers: { 'Content-Type': 'text/plain' },
		});
		vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

		const output = await processWithPlugin(
			markdown`
				~~~js src="github:user/repo/path/to/source.js"

				~~~
			`,
			{
				resolvers: {
					github: github(),
				},
			},
		);

		matchStringIgnoringWhitespace(output, EXPECTED_OUTPUT);
	});
});

test('should use custom resolver if provided', async () => {
	const output = await processWithPlugin(
		markdown`
			~~~js src="custom:./examples/test.js"

			~~~
		`,
		{
			resolvers: {
				custom: () => SOURCE,
			},
		},
	);

	matchStringIgnoringWhitespace(output, EXPECTED_OUTPUT);
});

describe('should respect global options.insert', () => {
	const input = markdown`
		~~~js src="custom:./examples/test.js"
		/// existing content
		~~~
	`;
	const customResolver = () => SOURCE;
	test('insert=prepend', async () => {
		const output = await processWithPlugin(input, {
			resolvers: { custom: customResolver },
			insert: 'prepend',
		});
		matchStringIgnoringWhitespace(
			output,
			html`
			<pre><code class="language-js">${SOURCE} /// existing content </code></pre>
		`,
		);
	});

	test('insert=append', async () => {
		const output = await processWithPlugin(input, {
			resolvers: { custom: customResolver },
			insert: 'append',
		});
		matchStringIgnoringWhitespace(
			output,
			html`
			<pre><code class="language-js">/// existing content ${SOURCE} </code></pre>
		`,
		);
	});

	test('insert=replace', async () => {
		const output = await processWithPlugin(input, {
			resolvers: { custom: customResolver },
			insert: 'replace',
		});
		matchStringIgnoringWhitespace(
			output,
			html`
			<pre><code class="language-js">${SOURCE} </code></pre>
		`,
		);
	});

	test('unknown insert value', async () => {
		const promise = processWithPlugin(input, {
			resolvers: { custom: customResolver },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			insert: 'unknown' as any,
		});
		await expect(promise).rejects.toThrow(
			`[remark-codeblock-source] Invalid insert option: unknown. Must be one of 'append', 'prepend', or 'replace'.`,
		);
	});
});

describe('should respect per-codeblock insert attribute', () => {
	test('insert=prepend', async () => {
		const output = await processWithPlugin(
			markdown`
				~~~js src|prepend="custom:./examples/test.js"
				/// existing content
				~~~
			`,
			{
				resolvers: { custom: () => SOURCE },
				insert: 'append',
			},
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<pre><code class="language-js">${SOURCE} /// existing content </code></pre>
			`,
		);
	});

	test('insert=append', async () => {
		const output = await processWithPlugin(
			markdown`
				~~~js src|append="custom:./examples/test.js"
				/// existing content
				~~~
			`,
			{
				resolvers: { custom: () => SOURCE },
				insert: 'prepend',
			},
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<pre><code class="language-js">/// existing content ${SOURCE} </code></pre>
			`,
		);
	});

	test('insert=replace', async () => {
		const output = await processWithPlugin(
			markdown`
				~~~js src|replace="custom:./examples/test.js"
				/// existing content
				~~~
			`,
			{
				resolvers: { custom: () => SOURCE },
				insert: 'append',
			},
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<pre><code class="language-js">${SOURCE} </code></pre>
			`,
		);
	});
});
