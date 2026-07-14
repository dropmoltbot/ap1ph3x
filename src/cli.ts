#!/usr/bin/env node
/**
 * Ap1ph3x CLI — Command-line tool for testing paid API calls
 * 
 * Usage:
 *   ap1ph3x fetch <url> [--method GET|POST] [--body json] [--chain base] [--protocol x402|mpp]
 *   ap1ph3x wallet [--chain base]
 *   ap1ph3x test
 */

import { Ap1ph3x } from './ap1ph3x.js';

const args = process.argv.slice(2);
const command = args[0];

function getEnv(key: string): string | undefined {
  return process.env[key] || process.env[key.toUpperCase()];
}

async function main() {
  if (!command) {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case 'fetch':
      await cmdFetch(args.slice(1));
      break;
    case 'wallet':
      cmdWallet();
      break;
    case 'test':
      await cmdTest();
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
  Ap1ph3x — Open-source payment client for AI agents

  Usage:
    ap1ph3x fetch <url> [options]    Make a paid API call
    ap1ph3x wallet                    Show wallet info
    ap1ph3x test                      Run self-test
    ap1ph3x help                      Show this help

  Options for fetch:
    --method <GET|POST|PUT|DELETE>     HTTP method (default: GET)
    --body <json>                      Request body (JSON string)
    --chain <base|ethereum|tempo>      Chain (default: base)
    --protocol <x402|mpp>              Payment protocol (default: x402)
    --max-call <amount>                Max spend per call in USDC
    --max-day <amount>                 Max spend per day in USDC

  Environment:
    PRIVATE_KEY                        EVM private key (0x...)
    
  Examples:
    ap1ph3x fetch https://api.example.com/data
    ap1ph3x fetch https://api.example.com/search --method POST --body '{"q":"test"}'
    ap1ph3x fetch https://api.example.com/data --protocol mpp
    ap1ph3x wallet
  `);
}

async function cmdFetch(args: string[]) {
  const privateKey = getEnv('PRIVATE_KEY');
  if (!privateKey) {
    console.error('❌ Set PRIVATE_KEY environment variable');
    process.exit(1);
  }

  const url = args[0];
  if (!url) {
    console.error('❌ URL required: ap1ph3x fetch <url>');
    process.exit(1);
  }

  const options: any = {};
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--method': options.method = args[++i]; break;
      case '--body': options.body = args[++i]; break;
      case '--chain': options.chain = args[++i]; break;
      case '--protocol': options.preferProtocol = args[++i]; break;
      case '--max-call': options.maxPerCall = args[++i]; break;
      case '--max-day': options.maxPerDay = args[++i]; break;
    }
  }

  const pay = new Ap1ph3x({
    privateKey: privateKey as `0x${string}`,
    chain: options.chain || 'base',
    defaultProtocol: options.preferProtocol || 'x402',
    maxPerCall: options.maxPerCall,
    maxPerDay: options.maxPerDay,
  });

  console.log(`🤖 Ap1ph3x — fetching ${url}`);
  console.log(`   Chain: ${pay.chainConfig.name} (${pay.chainConfig.chainId})`);
  console.log(`   Wallet: ${pay.address}`);
  console.log(`   Protocol: ${options.preferProtocol || 'x402'}`);
  console.log('');

  const start = Date.now();
  try {
    const response = await pay.fetch(url, {
      method: options.method,
      body: options.body,
      preferProtocol: options.preferProtocol,
    });

    const elapsed = Date.now() - start;
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Time: ${elapsed}ms`);

    if (response.status === 402) {
      console.log(`   ❌ Payment required but could not complete payment`);
      console.log(`   Response: ${text.slice(0, 300)}`);
    } else if (response.ok) {
      console.log(`   ✅ Success${(response as any).paid ? ' (paid)' : ' (free)'}`);
      try {
        const json = JSON.parse(text);
        console.log(`   Response: ${JSON.stringify(json, null, 2).slice(0, 500)}`);
      } catch {
        console.log(`   Response: ${text.slice(0, 300)}`);
      }
    } else {
      console.log(`   Response: ${text.slice(0, 300)}`);
    }
  } catch (error) {
    console.error(`   ❌ Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

function cmdWallet() {
  const privateKey = getEnv('PRIVATE_KEY');
  if (!privateKey) {
    console.error('❌ Set PRIVATE_KEY environment variable');
    process.exit(1);
  }

  const pay = new Ap1ph3x({
    privateKey: privateKey as `0x${string}`,
    chain: 'base',
  });

  console.log(`Wallet address: ${pay.address}`);
  console.log(`Chain: ${pay.chainConfig.name} (${pay.chainConfig.chainId})`);
  console.log(`USDC: ${pay.chainConfig.usdcAddress}`);
  console.log(`RPC: ${pay.chainConfig.rpcUrl}`);
}

async function cmdTest() {
  console.log('Ap1ph3x self-test');
  console.log('');

  // Test 1: Wallet creation
  try {
    const pay = new Ap1ph3x({
      privateKey: '0x' + '1'.repeat(64) as `0x${string}`,
      chain: 'base',
    });
    console.log('✅ Wallet creation: OK');
    console.log(`   Address: ${pay.address}`);
    console.log(`   Chain: ${pay.chainConfig.name}`);
  } catch (e) {
    console.log(`❌ Wallet creation: ${(e as Error).message}`);
  }

  // Test 2: Invalid key rejection
  try {
    new Ap1ph3x({ privateKey: '0x123' as `0x${string}` });
    console.log('❌ Invalid key rejection: FAILED (should have thrown)');
  } catch {
    console.log('✅ Invalid key rejection: OK');
  }

  // Test 3: Free endpoint (no payment needed)
  try {
    const pay = new Ap1ph3x({
      privateKey: '0x' + '1'.repeat(64) as `0x${string}`,
      chain: 'base',
    });
    const response = await pay.fetch('https://httpbin.org/get');
    if (response.ok) {
      console.log('✅ Free endpoint: OK (no payment needed)');
    } else {
      console.log(`⚠️  Free endpoint: status ${response.status}`);
    }
  } catch (e) {
    console.log(`⚠️  Free endpoint: ${(e as Error).message} (network issue)`);
  }

  console.log('');
  console.log('Done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});