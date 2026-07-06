import type { VFile } from 'vfile';

export type GithubResolver = (path: string) => Promise<string | null>;
export interface GithubResolverOptions {
	/**
	 * whether to cache the resolved source code for a given path **in memory**
	 * maybe helpful if you are working with a dev server that refreshes remark processing often,
	 * but be aware of the memory usage if using a lot of instances in your markdown.
	 * @default false
	 */
	cache?: boolean;
	/**
	 * optional fetch implementation to use for fetching from GitHub
	 * @default globalThis.fetch
	 */
	fetch?: (typeof globalThis)['fetch'];
}

export type FsResolver = (path: string, vfile: VFile) => Promise<string | null>;
export interface FsResolverOptions {
	/**
	 * whether to cache the resolved source code for a given path **in memory**
	 * maybe helpful if you are working with a dev server that refreshes remark processing often,
	 * but be aware of the memory usage if using a lot of instances in your markdown.
	 * @default false
	 */
	cache?: boolean;
}
