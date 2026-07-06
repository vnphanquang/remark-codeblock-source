import type { Code } from 'mdast';
import type { VFile } from 'vfile';

/** configure the behavior of `remark-codeblock-source` */
export interface RemarkCodeblockSourceOptions {
	/**
	 * mapping of namespace prefixes to their to resolver functions value, that is:
	 *
	 * - given a `key:value` as `[namespace]: resolver`
	 * - a codeblock that includes: `src=namespace:path/to/source`
	 * - will be resolved by calling: `resolver('path/to/source', vfile, node)`
	 *
	 * @example Use one of the built-in resolvers
	 *
	 * ```ts
	 * import remarkCodeblockSource from 'remark-codeblock-source';
	 * import { github, fs } from 'remark-codeblock-source/resolvers';
	 *
	 * await unified().use(remarkParse).use(remarkCodeblockSource, {
	 *    resolvers: {
	 *			fs: fs(),
	 *			github: github(),
	 *		},
	 * })
	 * ```
	 *
	 * @example Or create your own
	 *
	 * ```ts
	 * import remarkCodeblockSource from 'remark-codeblock-source';
	 *
	 * await unified().use(remarkParse).use(remarkCodeblockSource, {
	 *   resolvers: {
	 *     cms: async (path, vfile, node) => 'Some code from my CMS';
	 *   },
	 * });
	 * ```
	 */
	resolvers?: {
		[namespace: string]: RemarkCodeblockSourceResolver;
	};
	/**
	 * where to insert the resolved source code in relation to the existing code block content, if any
	 * @default `append`
	 */
	insert?: 'append' | 'prepend' | 'replace';
}

/**
 * instruct the plugin how to resolve the source code for a given "src" value
 * @param path the value of the "src" attribute, without the namespace prefix
 * @param vfile the virtual file being processed
 * @param node the code block node being processed
 * @returns the source code to replace the code block with, or a promise that resolves to it
 * return `null` to skip processing
 */
export type RemarkCodeblockSourceResolver = (
	path: string,
	vfile: VFile,
	node: Code,
) => null | string | Promise<string | null>;

