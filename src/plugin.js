import { CONTINUE, SKIP, visit } from 'unist-util-visit';

import { parseSrcFromMeta } from './utils.js';

/**
 * load external source into code blocks based on the `src` attribute in the meta string.
 * @param {import('./types.public').RemarkCodeblockSourceOptions} [options] - configure the plugin behavior
 * @returns {import('unified').Transformer<import('mdast').Root, import('mdast').Root>}
 *
 * @example This following setup:
 *
 * ```typescript
 * import rehypeStringify from 'rehype-stringify';
 * import remarkParse from 'remark-parse';
 * import remarkRehype from 'remark-rehype';
 * import remarkCodeblockSource from 'remark-codeblock-source';
 * import { github, fs } from 'remark-codeblock-source/resolvers';
 *
 * const output = await unified()
 *   .use(remarkParse)
 *   .use(remarkCodeblockSource, {
 *      resolvers: {
 *        fs: fs(),
 *        github: github()
 *      },
 *   })
 *   .use(remarkRehype)
 *   .use(rehypeStringify)
 *   .process('...');
 * ```
 *
 * Will match these codeblocks:
 *
 * - \`\`\`markdown src="github:account/:repo/:commit_or_branch/:filepath"
 * - \`\`\`typescript src="fs:./relative-to-file.ts"
 * - \`\`\`typescript src="fs:/relative-to-cwd.ts"
 */
export function remarkCodeblockSource(options) {
	const { resolvers = {}, insert = 'append' } = options ?? {};

	if (!['append', 'prepend', 'replace'].includes(insert)) {
		throw new Error(
			`[remark-codeblock-source] Invalid insert option: ${insert}. Must be one of 'append', 'prepend', or 'replace'.`
		)
	}

	return async function (tree, vfile) {
		/** @type {Promise<void>[]} */
		const promises = [];

		visit(tree, 'code', (node) => {
			const src = parseSrcFromMeta(node.meta);
			if (!src) return CONTINUE;

			const resolver = resolvers[src.namespace];
			if (!resolver) return CONTINUE;

			promises.push(
				Promise.resolve(resolver(src.path, vfile, node)).then((source) => {
					if (!source) return;
					switch (src.insert || insert) {
						case 'prepend': {
							node.value = `${source}\n${node.value}`;
							break;
						}
						case 'append': {
							node.value = `${node.value}\n${source}`;
							break;
						}
						case 'replace': {
							node.value = source;
							break;
						}
					}
				}),
			);

			return SKIP;
		});

		await Promise.all(promises);
	};
}
