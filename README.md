# remark-codeblock-source

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
import remarkCodeblockSource, { github, fs } from 'remark-codeblock-source';

const output = await unified()
	.use(remarkParse)
	.use(remarkCodeblockSource, {
		resolvers: [github(), fs()],
	})
	.use(remarkRehype)
	.use(rehypeStringify)
	.process('...');
```

will transform the following input...

````markdown
```markdown src="github:account/:repo/:commit_or_branch/:filepath"

```

```typescript src="file:./relative-to-file.ts"

```

```typescript src="file:/relative-to-cwd.ts"

```
````

...to this output:

```html
<pre><code>content fetched from: https://raw.githubusercontent.com/:account/:repo/:commit_or_branch/:filepath</code></pre>
<pre><code>content read from ./relative-to-file.ts</code></pre>
<pre><code>content read from :cwd/relative-to-cwd.ts</code></pre>
```

## Related Projects / Prior Arts

---

[built by me, not agents](https://gist.github.com/vnphanquang/018ee2b2080c9dc9890327f3d233998b).

<!-- header badges -->

[license.badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[npm.badge]: https://img.shields.io/npm/v/remark-codeblock-source
[npm]: https://www.npmjs.com/package/remark-codeblock-source
[codecov]: https://codecov.io/github/vnphanquang/remark-codeblock-source
[codecov.badge]: https://codecov.io/github/vnphanquang/remark-codeblock-source/graph/badge.svg?token=dKkYUy4evr
