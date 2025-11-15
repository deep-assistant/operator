#!/usr/bin/env node

import { chromium } from 'playwright';

const BASE_URL = 'https://deep-assistant.github.io/operator/';

async function testLiveSite() {
  console.log('Testing live site with simple approach...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log(`Navigating to: ${BASE_URL}`);

    // Use simpler waitUntil option
    await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    console.log('✓ Page loaded!');

    // Get title
    const title = await page.title();
    console.log(`✓ Title: ${title}`);

    // Count links
    const linkCount = await page.locator('a').count();
    console.log(`✓ Found ${linkCount} links`);

    // Count demo cards
    const cardCount = await page.locator('.demo-card').count();
    console.log(`✓ Found ${cardCount} demo cards`);

    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('✓ Screenshot saved');

    console.log('\n✓ All tests passed!');

  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testLiveSite();
