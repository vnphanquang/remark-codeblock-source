/** @type {Record<string, string>} */
const cache = {};

/**
 * @param {import("./types.public").GithubResolverOptions} [options] - configure the resolver behavior, e.g. caching
 * @returns {import("./types.public").GithubResolver}
 */
export function github(options = {}) {
	return async function (path) {
		try {
			if (options.cache && cache[path]) {
				return cache[path];
			}
			const response = await (options?.fetch ?? fetch)(`https://raw.githubusercontent.com/${path}`, {
				method: 'GET',
				headers: new Headers([['Accept', 'text/plain']]),
			});
			if (!response.ok) {
				console.error(
					`[remark-codeblock-source] Error fetching from GitHub: ${response.status} ${response.statusText}`,
				);
				return null;
			}
			const source = await response.text();
			if (options.cache) {
				cache[path] = source;
			}
			return source;
		} catch (error) {
			console.error(`[remark-codeblock-source] Error fetching from GitHub: ${error}`);
			return null;
		}
	};
}
