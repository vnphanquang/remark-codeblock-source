import { describe, expect, test } from 'vitest';

import { parseSrcFromMeta } from '../src/utils.js';

test('return null if meta is falsy', () => {
	expect(parseSrcFromMeta(null)).toBeNull();
	expect(parseSrcFromMeta(undefined)).toBeNull();
	expect(parseSrcFromMeta('')).toBeNull();
});

test('return null if meta does not contain src', () => {
	expect(parseSrcFromMeta('language attr="value"')).toBeNull();
});

describe('return null if meta contains src without namespace', () => {
	test('without quotes', () => {
		expect(parseSrcFromMeta('language src=path/to/source')).toBeNull();
	});

	test('with quotes', () => {
		expect(parseSrcFromMeta('language src="path/to/source"')).toBeNull();
	});
});

describe('return null if meta contains namespace but no path', () => {
	test('without quotes', () => {
		expect(parseSrcFromMeta('language src=namespace:')).toBeNull();
	});

	test('with quotes', () => {
		expect(parseSrcFromMeta('language src="namespace:"')).toBeNull();
	});
});

test('return null if path only contains whitespace', () => {
	expect(parseSrcFromMeta('language src="namespace:   "')).toBeNull();
});

test('return null if "src" is part of another attribute name', () => {
	expect(parseSrcFromMeta('language othersrc="namespace:path/to/source"')).toBeNull();
});

describe('return namespace & path', () => {
	test('without quotes', () => {
		expect(parseSrcFromMeta('language src=namespace:path/to/source')).toEqual({
			namespace: 'namespace',
			path: 'path/to/source',
		});

		expect(parseSrcFromMeta('language src=namespace:/path/to/source attr="value"')).toEqual({
			namespace: 'namespace',
			path: '/path/to/source',
		});
	});

	test('with quotes', () => {
		expect(parseSrcFromMeta('language src="namespace:./path/to/source" attr="value"')).toEqual({
			namespace: 'namespace',
			path: './path/to/source',
		});

		expect(parseSrcFromMeta('language src="namespace:path to source"')).toEqual({
			namespace: 'namespace',
			path: 'path to source',
		});
	});
});

describe('return insert, if any', () => {
	for (const insert of ['append', 'prepend', 'replace']) {
		describe(insert, () => {
			test('with quotes', () => {
				expect(parseSrcFromMeta(`language src|${insert}="namespace:path/to/source"`)).toEqual({
					namespace: 'namespace',
					path: 'path/to/source',
					insert,
				});
			});
			test('without quotes', () => {
				expect(parseSrcFromMeta(`language src|${insert}=namespace:path/to/source`)).toEqual({
					namespace: 'namespace',
					path: 'path/to/source',
					insert,
				});
			});
		});
	}
});

describe('should take the last src attribute if multiple are present', () => {
	test('without quotes', () => {
		expect(
			parseSrcFromMeta('language src=namespace1:path/to/source1 src=namespace2:path/to/source2'),
		).toEqual({
			namespace: 'namespace2',
			path: 'path/to/source2',
		});
	});

	test('with quotes', () => {
		expect(
			parseSrcFromMeta(
				'language src="namespace1:path/to/source1" src="namespace2:path/to/source2"',
			),
		).toEqual({
			namespace: 'namespace2',
			path: 'path/to/source2',
		});
	});

	test('mixed with and without quotes', () => {
		expect(
			parseSrcFromMeta(
				'language src|prepend=namespace1:path/to/source1 src|replace="namespace2:path/to/source2"',
			),
		).toEqual({
			namespace: 'namespace2',
			path: 'path/to/source2',
			insert: 'replace',
		});

		expect(
			parseSrcFromMeta(
				'language src|append="namespace1:path/to/source1" src|prepend=namespace2:path/to/source2',
			),
		).toEqual({
			namespace: 'namespace2',
			path: 'path/to/source2',
			insert: 'prepend',
		});
	});
});
