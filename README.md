# remark-codeblock-source

load codeblock content from external source (e.g. filesytem, GitHub, etc.)

[![MIT][license.badge]][license] [![npm.badge]][npm] [![codecov][codecov.badge]][codecov]

## Installation

```bash
pnpm add -D remark-codeblock-source # or via npm, yarn, ...
```

## Usage

This code...

```typescript
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkCodeblockSource from 'remark-codeblock-source';
import { github, fs } from 'remark-codeblock-source/resolvers';

const output = await unified()
	.use(remarkParse)
	.use(remarkCodeblockSource, {
		resolvers: { fs: fs(), github: github() },
	})
	.use(remarkRehype)
	.use(rehypeStringify)
	.process('...');
```

will transform the following input...

````markdown
```markdown src="github:account/:repo/:commit_or_branch/:filepath"

```

```typescript src="fs:./relative-to-file.ts"

```

```typescript src="fs:/relative-to-cwd.ts"

```
````

...to this output:

```html
<pre><code>content fetched from: https://raw.githubusercontent.com/:account/:repo/:commit_or_branch/:filepath</code></pre>
<pre><code>content read from ./relative-to-file.ts</code></pre>
<pre><code>content read from :cwd/relative-to-cwd.ts</code></pre>
```

## Meta Attribute `src`

The `src` attribute takes the following format:

````markdown
```language src=<namespace>[|insert]:<path>

```
````

where:

- `<namespace>`: the resolver key as defined in `resolvers` option. See [Resolvers](#resolvers) section for more details.
- `[|insert]`: optional modifier to specify where to insert the content. See [Insert Position](#insert-position) section for more details.
- `<path>`: the path to the source code, which is interpreted by the resolver.

> [!NOTE]
> When there are multiple `src` specified, the last one takes precedence.

If path contains spaces, wrap in double quotes, for example:

````markdown
```language src="fs:./path with spaces.ts"

```
````

## Resolvers

A codeblock with `src` attribute defined in its meta string will use the `namespace` (explained in [Meta Attribute `src`](#meta-attribute-src)) to look up the corresponding resolver function that instructs how to load the content from the given `path`.

### Builtin Resolver: `fs`

Read content from the filesystem, using the `node:fs/promises` API.

```typescript
import { fs } from 'remark-codeblock-source/resolvers';

unified.use(remarkCodeblockSource, {
	resolvers: { fs: fs() },
});
```

Path can be relative to the current file, or root-relative to the current working directory:

- `fs:./relative-to-file.ts` - relative to the file being processed
- `fs:/relative-to-cwd.ts` - relative to the current working directory

When you are using relative paths, make sure to pass [VFile](https://github.com/vfile/vfile) with `path`/`dirname` to unified/remark...

```typescript
const vfile = new VFile({
	path: 'path/to/file.md',
	value: markdown`
		~~~js src="fs:./source.js"

		~~~
	`,
});
unified.process(vfile);
```

...otherwise the resolved path will fall back to being relative to cwd.

### Builtin Resolver: `github`

Fetch content from Github via `raw.githubusercontent.com`.

```typescript
import { github } from 'remark-codeblock-source/resolvers';

unified.use(remarkCodeblockSource, {
	resolvers: { github: github() },
});
```

Path should be in the format of `github:account/:repo/:commit_or_branch/:filepath`:

````markdown
```markdown src="github:account/:repo/:commit_or_branch/:filepath"

```
````

### Custom Resolver

The resolver function is expected to return a string content, and can be optionally async:

```typescript
export type RemarkCodeblockSourceResolver = (
	path: string,
	vfile: VFile,
	node: Code,
) => null | string | Promise<string | null>;
```

For example, you may define a custom resolver that fetches content from your CMS:

```typescript
unified.use(remarkCodeblockSource, {
	resolvers: {
		cms: async (path) => {
			// no need to use the vfile and node args here
			const content = await fetchFromCMS(path);
			return content;
		},
	},
});
```

## Insert Position

By default, the resolved source will be appended to the codeblock content. To change this behavior,
either pass a global `insert` option to the plugin...

```typescript
unified.use(remarkCodeblockSource, {
	insert: 'prepend', // takes one of {'prepend', 'append', 'replace'}
});
```

...or specify the `insert` modifier in the `src` attribute:

````markdown
```language src|prepend="fs:./source.js"

```
````

## Related Projects / Prior Arts

- [kevin940726/remark-code-import](https://github.com/kevin940726/remark-code-import)

## CONTRIBUTING

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## More `unified` Plugins by Me

- [remark-transform-blockquote](https://github.com/vnphanquang/remark-transform-blockquote)
- [remark-enhance-codeblock](https://github.com/vnphanquang/remark-enhance-codeblock)

---

[built by human, not agents](https://gist.github.com/vnphanquang/018ee2b2080c9dc9890327f3d233998b).

<!-- header badges -->

[license.badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[npm.badge]: https://img.shields.io/npm/v/remark-codeblock-source
[npm]: https://www.npmjs.com/package/remark-codeblock-source
[codecov]: https://codecov.io/github/vnphanquang/remark-codeblock-source
[codecov.badge]: https://codecov.io/github/vnphanquang/remark-codeblock-source/graph/badge.svg?token=dKkYUy4evr
