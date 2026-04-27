import './setup.mjs';
import { test } from 'node:test';
import assert from 'node:assert';

// Now import the function
import { normalizeFundingPreference, formatFundingOptionsCount } from '../../frontend/javascript/pages/_shared.js';
import { setLanguage } from '../../frontend/javascript/i18n.js';

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


test('formatFundingOptionsCount', async (t) => {
  await t.test('English locale', async (t) => {
    setLanguage('eng', { persist: false, emit: false });

    await t.test('should format 0 correctly', () => {
      assert.strictEqual(formatFundingOptionsCount(0), '0 funding options');
    });

    await t.test('should format 1 correctly', () => {
      assert.strictEqual(formatFundingOptionsCount(1), '1 funding option');
    });

    await t.test('should format many correctly', () => {
      assert.strictEqual(formatFundingOptionsCount(2), '2 funding options');
      assert.strictEqual(formatFundingOptionsCount(10), '10 funding options');
    });

    await t.test('should handle invalid or null inputs by defaulting to 0', () => {
      assert.strictEqual(formatFundingOptionsCount(null), '0 funding options');
      assert.strictEqual(formatFundingOptionsCount(undefined), '0 funding options');
      assert.strictEqual(formatFundingOptionsCount('invalid'), '0 funding options');
    });
  });

  await t.test('Russian locale', async (t) => {
    setLanguage('rus', { persist: false, emit: false });

    await t.test('should format 0 correctly', () => {
      assert.strictEqual(formatFundingOptionsCount(0), '0 вариантов финансирования');
    });

    await t.test('should format 1 correctly', () => {
      assert.strictEqual(formatFundingOptionsCount(1), '1 вариант финансирования');
    });

    await t.test('should format few correctly', () => {
      assert.strictEqual(formatFundingOptionsCount(2), '2 варианта финансирования');
      assert.strictEqual(formatFundingOptionsCount(4), '4 варианта финансирования');
    });

    await t.test('should format many correctly', () => {
      assert.strictEqual(formatFundingOptionsCount(5), '5 вариантов финансирования');
      assert.strictEqual(formatFundingOptionsCount(11), '11 вариантов финансирования');
    });

    // Reset language after tests
    setLanguage('eng', { persist: false, emit: false });
  });
});
