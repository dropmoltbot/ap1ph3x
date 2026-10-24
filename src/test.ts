import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Ap1ph3x } from './ap1ph3x.js';
import { DEFAULT_CHAINS } from './chains.js';
import { getFreeAPIs, getX402APIs, searchAPIs, CATEGORIES } from './registry.js';

const TEST_KEY = ('0x' + '11'.repeat(32)) as `0x${string}`;

describe('wallet', () => {
  test('creates a client with a valid address', () => {
    const p = new Ap1ph3x({ privateKey: TEST_KEY, chain: 'base' });
    assert.match(p.address, /^0x[0-9a-fA-F]{40}$/);
  });

  test('rejects an invalid key', () => {
    assert.throws(() => new Ap1ph3x({ privateKey: '0xdeadbeef' as `0x${string}`, chain: 'base' }));
  });

  test('rejects an unknown chain', () => {
    assert.throws(() => new Ap1ph3x({ privateKey: TEST_KEY, chain: 'notachain' as never }));
  });

  test('daily spend starts at zero USDC', () => {
    const p = new Ap1ph3x({ privateKey: TEST_KEY, chain: 'base' });
    assert.equal(p.getDailySpend(), '0.000000');
  });
});

describe('chains', () => {
  test('6 chains configured', () => {
    assert.ok(Object.keys(DEFAULT_CHAINS).length >= 6);
    for (const [k, c] of Object.entries(DEFAULT_CHAINS)) {
      assert.ok(c.usdcAddress, `chain ${k} missing usdcAddress`);
      assert.ok(c.rpcUrl, `chain ${k} missing rpcUrl`);
    }
  });
});

describe('registry', () => {
  test('700+ free APIs', () => {
    assert.ok(getFreeAPIs().length >= 700);
  });
  test('50+ categories', () => {
    assert.ok(Object.keys(CATEGORIES).length >= 50);
  });
  test('search returns results for a common term', () => {
    const hits = searchAPIs('weather');
    assert.ok(Array.isArray(hits) && hits.length > 0);
  });
  test('x402 registry list currently empty (protocol supported client-side, registry has 0 x402 entries)', () => {
    assert.equal(getX402APIs().length, 0);
  });
});
