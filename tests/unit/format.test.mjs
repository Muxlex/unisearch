import './setup.mjs';
import { test } from 'node:test';
import assert from 'node:assert';

import { escapeHtmlAttr } from '../../frontend/javascript/utils/format.js';

test('escapeHtmlAttr', async (t) => {
  await t.test('escapes basic HTML characters', () => {
    assert.strictEqual(escapeHtmlAttr('&'), '&amp;');
    assert.strictEqual(escapeHtmlAttr('<'), '&lt;');
    assert.strictEqual(escapeHtmlAttr('>'), '&gt;');
    assert.strictEqual(escapeHtmlAttr('"'), '&quot;');
    assert.strictEqual(escapeHtmlAttr("'"), '&#039;');
  });

  await t.test('escapes multiple characters', () => {
    assert.strictEqual(
      escapeHtmlAttr('<div class="test" id=\'1\'>&</div>'),
      '&lt;div class=&quot;test&quot; id=&#039;1&#039;&gt;&amp;&lt;/div&gt;'
    );
  });

  await t.test('handles null and undefined', () => {
    assert.strictEqual(escapeHtmlAttr(null), '');
    assert.strictEqual(escapeHtmlAttr(undefined), '');
  });

  await t.test('handles empty strings', () => {
    assert.strictEqual(escapeHtmlAttr(''), '');
  });

  await t.test('leaves normal text unchanged', () => {
    assert.strictEqual(escapeHtmlAttr('hello world'), 'hello world');
    assert.strictEqual(escapeHtmlAttr('12345'), '12345');
  });

  await t.test('handles non-string types by converting to string', () => {
    assert.strictEqual(escapeHtmlAttr(123), '123');
    assert.strictEqual(escapeHtmlAttr(true), 'true');
    assert.strictEqual(escapeHtmlAttr(false), 'false');
  });
});
