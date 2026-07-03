import { visit } from 'unist-util-visit';

/**
 * @param {import('./types.public').RemarkCodeblockSourceOptions} [options] - configure the plugin behavior
 * @returns {import('unified').Transformer<import('mdast').Root, import('mdast').Root>}
 */
export function remarkCodeblockSource(options) {
	const { resolvers = [] } = options ?? {};

	/**
	 * @param {import('mdast').Root} tree - The markdown AST tree
	 */
	return function (tree) {
		visit(tree, (node, index, parent) => {
			console.log(resolvers, node, index, parent);
		});
	};
}
