/** @type {Record<string, string>} */
const cache = {};

/**
 * @param {import("./types.public").FsResolverOptions} [options] configure the resolver behavior, e.g. caching
 * @returns {import("./types.public").FsResolver}
 */
export function fs(options = {}) {
	return async function (path, vfile) {
		const { readFile } = await import('node:fs/promises');
		const { resolve, join, isAbsolute } = await import('node:path/posix');

		let rPath = path;
		if (isAbsolute(path)) {
			if (!vfile.cwd || path.startsWith(vfile.cwd)) {
				rPath = path;
			} else {
				rPath = resolve(vfile.cwd, path.slice(1));
			}
		} else if (vfile.dirname) {
			rPath = join(vfile.dirname, path);
		} else if (vfile.cwd) {
			rPath = resolve(vfile.cwd, path);
		}

		if (options.cache && cache[rPath]) {
			return cache[rPath];
		}

		try {
			const source = await readFile(rPath, 'utf-8');
			if (options.cache) {
				cache[rPath] = source;
			}
			return source;
		} catch (error) {
			console.error(`[remark-codeblock-source] Error reading file from fs: ${error}`);
			return null;
		}
	};
}
