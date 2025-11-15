#!/usr/bin/env node

import { chromium } from 'playwright';

const BASE_URL = 'https://deep-assistant.github.io/operator/';

// All demo page paths
const DEMO_PAGES = {
  landing: '',
  'cards-stream': {
    api: ['github', 'telegram', 'vk', 'x'],
    iframe: ['github', 'telegram', 'vk', 'x']
  },
  'list-sidebar': {
    api: ['github', 'telegram', 'vk', 'x'],
    iframe: ['github', 'telegram', 'vk', 'x']
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class TestResults {
  constructor() {
    this.total = 0;
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
  }

  addPass(testName) {
    this.total++;
    this.passed++;
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
  }

  addFail(testName, error) {
    this.total++;
    this.failed++;
    this.errors.push({ test: testName, error });
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    console.log(`  ${colors.red}${error}${colors.reset}`);
  }

  summary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${colors.cyan}Test Summary${colors.reset}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total:  ${this.total}`);
    console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
      this.errors.forEach(({ test, error }, index) => {
        console.log(`${index + 1}. ${test}`);
        console.log(`   ${error}\n`);
      });
    }

    return this.failed === 0;
  }
}

async function testPage(page, url, testName, results) {
  try {
    console.log(`\n${colors.blue}Testing:${colors.reset} ${testName}`);
    console.log(`${colors.blue}URL:${colors.reset} ${url}`);

    // Navigate to page
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check response status
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()} - ${response.statusText()}`);
    }

    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Check for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    if (jsErrors.length > 0) {
      throw new Error(`JavaScript errors: ${jsErrors.join(', ')}`);
    }

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Verify basic page structure
    const hasBody = await page.$('body');
    if (!hasBody) {
      throw new Error('Page has no body element');
    }

    // Check if page has content
    const bodyText = await page.textContent('body');
    if (!bodyText || bodyText.trim().length === 0) {
      throw new Error('Page appears to be empty');
    }

    // Check for critical CSS
    const hasStyles = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.length > 0 || document.querySelectorAll('style').length > 0;
    });

    if (!hasStyles) {
      console.log(`${colors.yellow}⚠${colors.reset} Warning: No stylesheets detected`);
    }

    // Check page title
    const title = await page.title();
    if (!title || title.trim().length === 0) {
      console.log(`${colors.yellow}⚠${colors.reset} Warning: No page title`);
    } else {
      console.log(`  Title: "${title}"`);
    }

    // Take screenshot
    const screenshotPath = `screenshots/${testName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`  Screenshot: ${screenshotPath}`);

    results.addPass(testName);
  } catch (error) {
    results.addFail(testName, error.message);
  }
}

async function runTests() {
  console.log(`${colors.cyan}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset} Operator Demo Pages - Comprehensive Test Suite          ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚${'═'.repeat(58)}╝${colors.reset}\n`);

  const results = new TestResults();

  // Create screenshots directory
  const fs = await import('fs');
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    // Test landing page
    console.log(`\n${colors.yellow}Testing Landing Page${colors.reset}`);
    console.log('─'.repeat(60));
    await testPage(page, BASE_URL, 'Landing Page', results);

    // Test cards-stream demos
    console.log(`\n${colors.yellow}Testing Cards Stream Demos${colors.reset}`);
    console.log('─'.repeat(60));
    for (const [type, platforms] of Object.entries(DEMO_PAGES['cards-stream'])) {
      for (const platform of platforms) {
        const url = `${BASE_URL}cards-stream/${type}/${platform}/`;
        const testName = `Cards Stream - ${type.toUpperCase()} - ${platform}`;
        await testPage(page, url, testName, results);
      }
    }

    // Test list-sidebar demos
    console.log(`\n${colors.yellow}Testing List + Sidebar Demos${colors.reset}`);
    console.log('─'.repeat(60));
    for (const [type, platforms] of Object.entries(DEMO_PAGES['list-sidebar'])) {
      for (const platform of platforms) {
        const url = `${BASE_URL}list-sidebar/${type}/${platform}/`;
        const testName = `List + Sidebar - ${type.toUpperCase()} - ${platform}`;
        await testPage(page, url, testName, results);
      }
    }

  } finally {
    await browser.close();
  }

  const success = results.summary();
  process.exit(success ? 0 : 1);
}

runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
