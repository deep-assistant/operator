#!/usr/bin/env node

import { chromium } from 'playwright';

async function verify() {
  console.log('Verifying Playwright setup...\n');

  try {
    console.log('1. Launching browser...');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✓ Browser launched successfully');

    console.log('\n2. Creating page...');
    const page = await browser.newPage();
    console.log('✓ Page created successfully');

    console.log('\n3. Setting content...');
    await page.setContent('<html><body><h1>Test</h1></body></html>');
    console.log('✓ Content set successfully');

    console.log('\n4. Reading content...');
    const h1 = await page.textContent('h1');
    console.log(`✓ Content read: "${h1}"`);

    await browser.close();
    console.log('\n✓ Playwright is working correctly!\n');
    return true;
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    return false;
  }
}

verify().then(success => process.exit(success ? 0 : 1));
