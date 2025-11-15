#!/usr/bin/env node

import { chromium } from 'playwright';

const BASE_URL = 'https://deep-assistant.github.io/operator/';

// Extract proxy from environment
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
console.log('Using proxy:', proxyUrl ? 'configured' : 'none');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testWithProxy() {
  console.log(`${colors.cyan}Testing Live Site with Proxy Configuration${colors.reset}\n`);

  // Parse proxy URL
  let proxyConfig = null;
  if (proxyUrl) {
    try {
      const url = new URL(proxyUrl);
      proxyConfig = {
        server: `${url.protocol}//${url.host}`,
        username: url.username || undefined,
        password: url.password || undefined
      };
      console.log(`${colors.blue}Proxy server:${colors.reset} ${proxyConfig.server}`);
    } catch (e) {
      console.log(`${colors.yellow}Warning: Could not parse proxy URL${colors.reset}`);
    }
  }

  const browser = await chromium.launch({
    headless: true,
    proxy: proxyConfig,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log(`\n${colors.blue}Testing:${colors.reset} Landing Page`);
    console.log(`${colors.blue}URL:${colors.reset} ${BASE_URL}\n`);

    await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    console.log(`${colors.green}✓${colors.reset} Page loaded successfully!`);

    // Get page title
    const title = await page.title();
    console.log(`${colors.green}✓${colors.reset} Title: "${title}"`);

    // Count demo cards
    const cardCount = await page.locator('.demo-card').count();
    console.log(`${colors.green}✓${colors.reset} Found ${cardCount} demo cards`);

    // Count links
    const linkCount = await page.locator('a[href*="index.html"]').count();
    console.log(`${colors.green}✓${colors.reset} Found ${linkCount} demo links`);

    // Verify header
    const h1Text = await page.locator('h1').first().textContent();
    console.log(`${colors.green}✓${colors.reset} Header: "${h1Text}"`);

    // Take screenshot
    await page.screenshot({ path: 'landing-page-test.png', fullPage: true });
    console.log(`${colors.green}✓${colors.reset} Screenshot saved: landing-page-test.png`);

    console.log(`\n${colors.green}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}SUCCESS! All tests passed!${colors.reset}`);
    console.log(`${colors.green}${'═'.repeat(60)}${colors.reset}\n`);

    return true;
  } catch (error) {
    console.error(`\n${colors.red}✗ Error:${colors.reset}`, error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testWithProxy()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
