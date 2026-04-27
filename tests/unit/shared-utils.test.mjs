import './setup.mjs';
import { test } from 'node:test';
import assert from 'node:assert';

// Now import the function
import { normalizeFundingPreference, normalizeUrl } from '../../frontend/javascript/pages/_shared.js';

test('normalizeFundingPreference', async (t) => {
  await t.test('should return grant for grant', () => {
    assert.strictEqual(normalizeFundingPreference('grant'), 'grant');
  });

  await t.test('should return paid for paid', () => {
    assert.strictEqual(normalizeFundingPreference('paid'), 'paid');
  });

  await t.test('should handle case insensitivity', () => {
    assert.strictEqual(normalizeFundingPreference('GRANT'), 'grant');
    assert.strictEqual(normalizeFundingPreference('Paid'), 'paid');
  });

  await t.test('should handle whitespace', () => {
    assert.strictEqual(normalizeFundingPreference('  grant  '), 'grant');
  });

  await t.test('should return any for other values', () => {
    assert.strictEqual(normalizeFundingPreference('any'), 'any');
    assert.strictEqual(normalizeFundingPreference('random'), 'any');
    assert.strictEqual(normalizeFundingPreference(''), 'any');
    assert.strictEqual(normalizeFundingPreference(null), 'any');
    assert.strictEqual(normalizeFundingPreference(undefined), 'any');
  });
});

test('normalizeUrl', async (t) => {
  await t.test('should return empty string for empty/falsy/non-string inputs', () => {
    assert.strictEqual(normalizeUrl(''), '');
    assert.strictEqual(normalizeUrl(null), '');
    assert.strictEqual(normalizeUrl(undefined), '');
    assert.strictEqual(normalizeUrl(123), '');
    assert.strictEqual(normalizeUrl({}), '');
    assert.strictEqual(normalizeUrl('   '), '');
  });

  await t.test('should return valid http and https URLs unchanged', () => {
    assert.strictEqual(normalizeUrl('http://example.com'), 'http://example.com');
    assert.strictEqual(normalizeUrl('https://example.com'), 'https://example.com');
    assert.strictEqual(normalizeUrl('  https://example.com  '), 'https://example.com');
  });

  await t.test('should handle case insensitivity for protocol and www', () => {
    assert.strictEqual(normalizeUrl('HTTP://example.com'), 'HTTP://example.com');
    assert.strictEqual(normalizeUrl('Https://example.com'), 'Https://example.com');
    assert.strictEqual(normalizeUrl('WWW.example.com'), 'https://WWW.example.com');
  });

  await t.test('should prepend https: to URLs starting with //', () => {
    assert.strictEqual(normalizeUrl('//example.com'), 'https://example.com');
  });

  await t.test('should prepend https:// to URLs starting with www.', () => {
    assert.strictEqual(normalizeUrl('www.example.com'), 'https://www.example.com');
  });

  await t.test('should return empty string for invalid URL formats that are missing scheme or www', () => {
    assert.strictEqual(normalizeUrl('example.com'), '');
    assert.strictEqual(normalizeUrl('ftp://example.com'), '');
    assert.strictEqual(normalizeUrl('mailto:test@example.com'), '');
    assert.strictEqual(normalizeUrl('http//example.com'), '');
  });
});
