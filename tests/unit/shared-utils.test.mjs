import './setup.mjs';
import { test } from 'node:test';
import assert from 'node:assert';

// Now import the function
import { normalizeFundingPreference, cleanDecoratedText } from '../../frontend/javascript/pages/_shared.js';

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

test('cleanDecoratedText', async (t) => {
  await t.test('should strip leading emojis and symbols', () => {
    assert.strictEqual(cleanDecoratedText('🔥 Hot program'), 'Hot program');
    assert.strictEqual(cleanDecoratedText('⭐ Top rated'), 'Top rated');
    assert.strictEqual(cleanDecoratedText('- List item'), 'List item');
    assert.strictEqual(cleanDecoratedText('>>> Hello'), 'Hello');
  });

  await t.test('should handle HTML fragments by stripping leading non-alphanumeric characters', () => {
    assert.strictEqual(cleanDecoratedText('<div>Hello</div>'), 'div>Hello</div>');
    assert.strictEqual(cleanDecoratedText('<b>Bold</b>'), 'b>Bold</b>');
    assert.strictEqual(cleanDecoratedText('   <p>HTML</p>'), 'p>HTML</p>');
  });

  await t.test('should retain middle or trailing decorators', () => {
    assert.strictEqual(cleanDecoratedText('Hot 🔥 program'), 'Hot 🔥 program');
    assert.strictEqual(cleanDecoratedText('Top rated ⭐'), 'Top rated ⭐');
  });

  await t.test('should return original string if it contains only decorators', () => {
    assert.strictEqual(cleanDecoratedText('🔥'), '🔥');
    assert.strictEqual(cleanDecoratedText('***'), '***');
  });

  await t.test('should handle empty, falsy, and whitespace values', () => {
    assert.strictEqual(cleanDecoratedText(''), '');
    assert.strictEqual(cleanDecoratedText(null), '');
    assert.strictEqual(cleanDecoratedText(undefined), '');
    assert.strictEqual(cleanDecoratedText('   '), '');
  });
});
