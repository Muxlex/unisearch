import './setup.mjs';
import { test } from 'node:test';
import assert from 'node:assert';

// Now import the function
import { hashString } from '../../frontend/javascript/components/shell.js';

test('hashString', async (t) => {
  await t.test('should return 0 for empty string', () => {
    assert.strictEqual(hashString(''), '0');
  });

  await t.test('should return consistent hash for same string', () => {
    const str = 'hello world';
    assert.strictEqual(hashString(str), hashString(str));
  });

  await t.test('should return expected hash for known string', () => {
    // The hash function is:
    // hash = 0
    // for each char: hash = ((hash << 5) - hash) + charCode; hash |= 0;
    // 'a' = 97 => (0 - 0) + 97 = 97
    // 'b' = 98 => ((97 << 5) - 97) + 98 = 3104 - 97 + 98 = 3105
    assert.strictEqual(hashString('a'), '97');
    assert.strictEqual(hashString('ab'), '3105');
  });

  await t.test('should handle different length strings', () => {
    assert.notStrictEqual(hashString('test'), hashString('test1'));
  });

  await t.test('should handle different case strings', () => {
    assert.notStrictEqual(hashString('hello'), hashString('HELLO'));
  });

  await t.test('should handle unicode characters', () => {
    const str = 'こんにちは';
    assert.strictEqual(hashString(str), hashString(str));
    assert.notStrictEqual(hashString('こんにちは'), hashString('こんにちわ'));
  });

  await t.test('should return correct string type', () => {
    assert.strictEqual(typeof hashString('test'), 'string');
  });
});
