import './setup.mjs';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  readSettingsArray,
  writeSettingsArray,
  getSettingValue,
  setSettingValue,
  shouldStoreRecentUniversities,
  shouldOpenUniversitiesInNewTab,
  SETTINGS_CACHE_KEY,
  SETTING_DISABLE_RECENT_UNIVERSITIES,
  SETTING_OPEN_UNIVERSITIES_NEW_TAB,
} from '../../frontend/javascript/settings.js';

describe('settings.js', () => {
    let mockStorage = {};
    let eventsDispatched = [];

    beforeEach(() => {
        mockStorage = {};
        eventsDispatched = [];

        global.localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, value) => { mockStorage[key] = String(value); },
            removeItem: (key) => { delete mockStorage[key]; }
        };

        global.window.dispatchEvent = (event) => {
            eventsDispatched.push(event);
        };

        // Mock CustomEvent properly for this test
        global.CustomEvent = class CustomEvent {
            constructor(type, options) {
                this.type = type;
                this.detail = options ? options.detail : null;
            }
        };
    });

    test('readSettingsArray returns defaults when storage is empty', () => {
        const settings = readSettingsArray();
        assert.ok(Array.isArray(settings));

        const disableRecent = settings.find(s => s.key === SETTING_DISABLE_RECENT_UNIVERSITIES);
        assert.strictEqual(disableRecent.value, false);

        const newTab = settings.find(s => s.key === SETTING_OPEN_UNIVERSITIES_NEW_TAB);
        assert.strictEqual(newTab.value, false);
    });

    test('readSettingsArray merges valid stored JSON with definitions', () => {
        mockStorage[SETTINGS_CACHE_KEY] = JSON.stringify([
            { key: SETTING_DISABLE_RECENT_UNIVERSITIES, value: true }
        ]);

        const settings = readSettingsArray();

        const disableRecent = settings.find(s => s.key === SETTING_DISABLE_RECENT_UNIVERSITIES);
        assert.strictEqual(disableRecent.value, true);

        const newTab = settings.find(s => s.key === SETTING_OPEN_UNIVERSITIES_NEW_TAB);
        assert.strictEqual(newTab.value, false); // still default
    });

    test('readSettingsArray handles invalid JSON', () => {
        mockStorage[SETTINGS_CACHE_KEY] = "invalid json";

        const settings = readSettingsArray();

        const disableRecent = settings.find(s => s.key === SETTING_DISABLE_RECENT_UNIVERSITIES);
        assert.strictEqual(disableRecent.value, false);
    });

    test('readSettingsArray handles non-array parsed values', () => {
        mockStorage[SETTINGS_CACHE_KEY] = JSON.stringify({ key: "val" }); // Object, not array

        const settings = readSettingsArray();

        const disableRecent = settings.find(s => s.key === SETTING_DISABLE_RECENT_UNIVERSITIES);
        assert.strictEqual(disableRecent.value, false); // should fall back to defaults
    });

    test('writeSettingsArray writes correct JSON to localStorage', () => {
        const inputSettings = [
            { key: SETTING_DISABLE_RECENT_UNIVERSITIES, value: true },
            { key: SETTING_OPEN_UNIVERSITIES_NEW_TAB, value: true }
        ];

        const saved = writeSettingsArray(inputSettings);

        assert.strictEqual(saved.length, 2);

        const storedStr = mockStorage[SETTINGS_CACHE_KEY];
        assert.ok(storedStr);
        const storedArr = JSON.parse(storedStr);

        const disableRecent = storedArr.find(s => s.key === SETTING_DISABLE_RECENT_UNIVERSITIES);
        assert.strictEqual(disableRecent.value, true);
    });

    test('writeSettingsArray normalizes values', () => {
        const inputSettings = [
            { key: SETTING_DISABLE_RECENT_UNIVERSITIES, value: "true" } // boolean should be strictly converted
        ];

        const saved = writeSettingsArray(inputSettings);

        const storedStr = mockStorage[SETTINGS_CACHE_KEY];
        const storedArr = JSON.parse(storedStr);

        const disableRecent = storedArr.find(s => s.key === SETTING_DISABLE_RECENT_UNIVERSITIES);
        assert.strictEqual(disableRecent.value, false); // "true" !== true
    });

    test('writeSettingsArray handles invalid input gracefully', () => {
        const saved = writeSettingsArray(null);
        assert.strictEqual(saved[0].value, false);
    });

    test('getSettingValue returns correct value', () => {
        mockStorage[SETTINGS_CACHE_KEY] = JSON.stringify([
            { key: SETTING_DISABLE_RECENT_UNIVERSITIES, value: true }
        ]);

        assert.strictEqual(getSettingValue(SETTING_DISABLE_RECENT_UNIVERSITIES), true);
        assert.strictEqual(getSettingValue(SETTING_OPEN_UNIVERSITIES_NEW_TAB), false);
    });

    test('getSettingValue returns undefined for unknown keys', () => {
        assert.strictEqual(getSettingValue('unknown_key'), undefined);
    });

    test('setSettingValue updates storage and dispatches event', () => {
        setSettingValue(SETTING_DISABLE_RECENT_UNIVERSITIES, true);

        const storedStr = mockStorage[SETTINGS_CACHE_KEY];
        assert.ok(storedStr);
        const storedArr = JSON.parse(storedStr);

        const disableRecent = storedArr.find(s => s.key === SETTING_DISABLE_RECENT_UNIVERSITIES);
        assert.strictEqual(disableRecent.value, true);

        assert.strictEqual(eventsDispatched.length, 1);
        const event = eventsDispatched[0];
        assert.strictEqual(event.type, 'settingsChanged');
        assert.ok(event.detail);
        assert.strictEqual(event.detail.key, SETTING_DISABLE_RECENT_UNIVERSITIES);
        assert.strictEqual(event.detail.value, true);
        assert.ok(Array.isArray(event.detail.settings));
    });

    test('setSettingValue ignores event dispatch errors', () => {
        global.window.dispatchEvent = () => { throw new Error('Dispatch error'); };

        assert.doesNotThrow(() => {
            setSettingValue(SETTING_DISABLE_RECENT_UNIVERSITIES, true);
        });

        assert.strictEqual(getSettingValue(SETTING_DISABLE_RECENT_UNIVERSITIES), true);
    });

    test('shouldStoreRecentUniversities returns correct value', () => {
        mockStorage[SETTINGS_CACHE_KEY] = JSON.stringify([
            { key: SETTING_DISABLE_RECENT_UNIVERSITIES, value: false }
        ]);
        assert.strictEqual(shouldStoreRecentUniversities(), true);

        mockStorage[SETTINGS_CACHE_KEY] = JSON.stringify([
            { key: SETTING_DISABLE_RECENT_UNIVERSITIES, value: true }
        ]);
        assert.strictEqual(shouldStoreRecentUniversities(), false);
    });

    test('shouldOpenUniversitiesInNewTab returns correct value', () => {
        mockStorage[SETTINGS_CACHE_KEY] = JSON.stringify([
            { key: SETTING_OPEN_UNIVERSITIES_NEW_TAB, value: true }
        ]);
        assert.strictEqual(shouldOpenUniversitiesInNewTab(), true);

        mockStorage[SETTINGS_CACHE_KEY] = JSON.stringify([
            { key: SETTING_OPEN_UNIVERSITIES_NEW_TAB, value: false }
        ]);
        assert.strictEqual(shouldOpenUniversitiesInNewTab(), false);
    });
});
