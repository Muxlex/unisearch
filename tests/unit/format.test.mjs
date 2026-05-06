import './setup.mjs';
import { test } from 'node:test';
import assert from 'node:assert';
import { escapeHtml } from '../../frontend/javascript/utils/format.js';

test('escapeHtml', async (t) => {
  await t.test('escapes standard HTML characters', () => {
    assert.strictEqual(escapeHtml('<div class="test">Hello & \'world\'</div>'), '&lt;div class=&quot;test&quot;&gt;Hello &amp; &#039;world&#039;&lt;/div&gt;');
  });

  await t.test('handles null and undefined', () => {
    assert.strictEqual(escapeHtml(null), '');
    assert.strictEqual(escapeHtml(undefined), '');
  });

  await t.test('handles non-string types', () => {
    assert.strictEqual(escapeHtml(123), '123');
    assert.strictEqual(escapeHtml(true), 'true');
    assert.strictEqual(escapeHtml(false), 'false');
  });

  await t.test('stabilizes numeric ranges within escapeHtml', () => {
    assert.strictEqual(escapeHtml('10 - 20'), '10\u201120');
    assert.strictEqual(escapeHtml('1.5 - 2.5'), '1.5\u20112.5');
  });

  await t.test('handles empty string', () => {
    assert.strictEqual(escapeHtml(''), '');
  });
});
