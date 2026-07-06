import { expect, test } from 'vitest';

import { fs, github } from '../../src/resolvers';

test('fs resolver should be exported', () => {
	expect(fs).toBeDefined();
});

test('github resolver should be exported', () => {
	expect(github).toBeDefined();
});
