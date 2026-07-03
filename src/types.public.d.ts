/** configure the behavior of `remark-codeblock-source` */
export interface RemarkCodeblockSourceOptions {
	resolvers?: RemarkCodeblockSourceResolve[];
}

interface RemarkCodeblockSourceResolve {
	pattern: `${string}:${string}`;
}
