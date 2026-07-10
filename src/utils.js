/// with quote: /src(\|(?:append|prepend|replace))?="([^|"]+):([^|"]+)"/
/// without quote: /src(\|(?:append|prepend|replace))?=([^\s"]+):([^\s"]+)/

/**
 * parses the src attribute from a {@linkcode import('mdast').Code} meta string.
 * @param {string|null|undefined} meta the meta string from mdast blockcode node
 * @returns {null | { insert?: 'append' | 'prepend' | 'replace', namespace: string, path: string}}
 */
export function parseSrcFromMeta(meta) {
	if (!meta?.includes('src')) return null;
	const matches = Array.from(
		meta.matchAll(/(?:^|\s)src\|?((?:append|prepend|replace)?)=(?:"([^"]+):([^"]+)"|([^\s"]+):([^\s"]+))/g),
	);
	const match = matches[matches.length - 1];
	if (!match) return null;
	const insert = /** @type { 'append' | 'prepend' | 'replace' | undefined} */ (
		match[1] || undefined
	);
	const namespace = (match[2] ?? match[4]).trim();
	const path = (match[3] ?? match[5]).trim();
	if (!path) return null;
	return {
		insert,
		namespace,
		path,
	};
}
