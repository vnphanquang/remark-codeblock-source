import { fs as mFs, vol } from 'memfs';
import { VFile } from 'vfile';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { fs } from '../../src/resolvers/fs.js';

// tell vitest to use fs mock from __mocks__ folder
vi.mock('node:fs');
vi.mock('node:fs/promises');

const SOURCE = `console.log("Hello, world!");`;
const vfile = new VFile({
	path: '/project/index.md',
	cwd: '/project',
});

afterEach(() => {
	vol.reset();
});

describe('should return file content from fs, scoped within cwd', () => {
	beforeEach(() => {
		vol.fromJSON({
			'/project/examples/test.ts': SOURCE,
			'/protected/test.ts': 'console.log("This should not be accessible");',
		});
	});

	test('relative to vfile', async () => {
		const path = 'examples/test.ts';
		expect(await fs()(path, vfile)).toBe(SOURCE);
	});

	test('absolute path', async () => {
		const path = '/project/examples/test.ts';
		expect(await fs()(path, vfile)).toBe(SOURCE);
	});

	test('root-relative path to cwd', async () => {
		const path = '/examples/test.ts';
		expect(await fs()(path, vfile)).toBe(SOURCE);
	});

	test('scope back to cwd if attempting to escape to outside directory', async () => {
		const path = '/protected/test.ts';
		const spiedConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(await fs()(path, vfile)).toBeNull();
		expect(spiedConsoleError).toHaveBeenCalledWith(
			"[remark-codeblock-source] Error reading file from fs: Error: ENOENT: no such file or directory, open '/project/protected/test.ts'",
		);
	});

	test('resolve to vfile.cwd if vfile.dirname is not available', async () => {
		const vfile = new VFile({ cwd: '/project' });
		const path = 'examples/test.ts';
		expect(await fs()(path, vfile)).toBe(SOURCE);
	});

	test('should use path as is if vfile.cwd is not available', async () => {
		const vfile = new VFile({ cwd: undefined });
		expect(await fs()('/project/examples/test.ts', vfile)).toBe(SOURCE);
		expect(await fs()('examples/test.ts', vfile)).toBeNull();
	});
});

test('cache should take effect if turned on', async () => {
	vol.fromJSON({ '/project/examples/test.ts': SOURCE });

	const spiedOnReadFile = vi.spyOn(mFs.promises, 'readFile');

	const path = 'examples/test.ts';
	expect(await fs({ cache: true })(path, vfile)).toBe(SOURCE);
	expect(await fs({ cache: true })(path, vfile)).toBe(SOURCE);

	expect(spiedOnReadFile).toHaveBeenCalledTimes(1);
});
