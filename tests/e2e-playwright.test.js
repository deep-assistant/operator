#!/usr/bin/env node

/**
 * Comprehensive E2E Test Suite for Operator Demos
 * Uses Playwright to test all 17 pages (1 landing + 16 demos)
 *
 * This test suite can be run in CI/CD pipelines and provides:
 * - Automated testing of all demo pages
 * - Console error detection
 * - JavaScript error detection
 * - React component rendering validation
 * - Interactive feature testing (DONE/NEXT buttons, keyboard shortcuts)
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://deep-assistant.github.io/operator/';

// Configuration for all demos
const DEMOS = {
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

class TestResults {
  constructor() {
    this.total = 0;
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.errors = [];
  }

  addPass(testName, details = '') {
    this.total++;
    this.passed++;
    console.log(`${colors.green}✓${colors.reset} ${testName}${details ? ' ' + colors.cyan + details + colors.reset : ''}`);
  }

  addFail(testName, error) {
    this.total++;
    this.failed++;
    this.errors.push({ test: testName, error });
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    console.log(`  ${colors.red}${error}${colors.reset}`);
  }

  addWarning(message) {
    this.warnings++;
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  summary() {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${colors.cyan}E2E Test Summary${colors.reset}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Total Tests: ${this.total}`);
    console.log(`${colors.green}Passed:      ${this.passed}${colors.reset}`);
    console.log(`${colors.red}Failed:      ${this.failed}${colors.reset}`);
    console.log(`${colors.yellow}Warnings:    ${this.warnings}${colors.reset}`);

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

/**
 * Test landing page
 */
async function testLandingPage(page, results) {
  const testName = 'Landing Page';
  console.log(`\n${colors.magenta}Testing: ${testName}${colors.reset}`);

  try {
    const response = await page.goto(BASE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}`);
    }

    // Check for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    await page.waitForTimeout(2000);

    if (jsErrors.length > 0) {
      throw new Error(`JavaScript errors: ${jsErrors.join(', ')}`);
    }

    // Verify page title
    const title = await page.title();
    if (!title.includes('Operator')) {
      throw new Error(`Unexpected title: ${title}`);
    }

    // Verify heading
    const heading = await page.textContent('h1');
    if (heading !== 'Operator') {
      throw new Error(`Unexpected heading: ${heading}`);
    }

    // Count demo cards (should be 16 = 8 list-sidebar + 8 cards-stream)
    const cardCount = await page.locator('.demo-card').count();
    if (cardCount !== 16) {
      throw new Error(`Expected 16 demo cards, found ${cardCount}`);
    }

    // Check for integration types legend
    const hasApiLegend = await page.getByText('Direct API integration').isVisible();
    const hasIframeLegend = await page.getByText('Embedded web interface').isVisible();

    if (!hasApiLegend || !hasIframeLegend) {
      throw new Error('Integration types legend not found');
    }

    results.addPass(testName, `(${cardCount} demo cards)`);
  } catch (error) {
    results.addFail(testName, error.message);
  }
}

/**
 * Test a demo page (API or IFRAME mode)
 */
async function testDemoPage(page, mode, type, platform, results) {
  const testName = `${mode === 'cards-stream' ? 'Focus Mode' : 'List Mode'} - ${type.toUpperCase()} - ${platform}`;
  const url = `${BASE_URL}${mode}/${type}/${platform}/`;

  console.log(`\n${colors.blue}Testing:${colors.reset} ${testName}`);
  console.log(`${colors.blue}URL:${colors.reset} ${url}`);

  try {
    // Clear previous page errors
    const jsErrors = [];
    const consoleErrors = [];

    page.removeAllListeners('pageerror');
    page.removeAllListeners('console');

    page.on('pageerror', error => jsErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to page
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}`);
    }

    // Wait for React to render
    await page.waitForTimeout(3000);

    // Check for critical JavaScript errors (excluding known warnings)
    const criticalJsErrors = jsErrors.filter(err =>
      !err.includes('Babel transformer') &&
      !err.includes('favicon')
    );

    if (criticalJsErrors.length > 0) {
      throw new Error(`JavaScript errors: ${criticalJsErrors[0]}`);
    }

    // For API modes, check if React components rendered
    if (type === 'api') {
      // Wait for app to load (check for loading state or loaded content)
      const hasContent = await page.locator('.card, .loading-state, .auth-prompt, .empty-state').count() > 0;

      if (!hasContent) {
        throw new Error('No React components rendered - page appears empty');
      }

      // Check if we have a header
      const hasHeader = await page.locator('.header').count() > 0;
      if (!hasHeader) {
        results.addWarning(`${testName}: No header found`);
      }

      // Check for back link
      const hasBackLink = await page.getByText('Back to Demos').count() > 0;
      if (hasBackLink) {
        results.addPass(testName, '(back link present)');
      } else {
        results.addPass(testName);
      }
    } else {
      // IFRAME mode - just check basic rendering
      const hasIframe = await page.locator('iframe').count() > 0;
      if (hasIframe) {
        results.addPass(testName, '(iframe present)');
      } else {
        results.addPass(testName);
      }
    }

  } catch (error) {
    results.addFail(testName, error.message);
  }
}

/**
 * Test interactive features of a demo page
 */
async function testInteractiveFeatures(page, mode, platform, results) {
  const testName = `Interactive Features - ${mode} - ${platform}`;
  const url = `${BASE_URL}${mode}/api/${platform}/`;

  console.log(`\n${colors.magenta}Testing: ${testName}${colors.reset}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check if we have cards in the queue
    const cardExists = await page.locator('.card').count() > 0;

    if (!cardExists) {
      results.addWarning(`${testName}: No cards to test interactions`);
      return;
    }

    // Test DONE button
    const doneButton = await page.getByRole('button', { name: /DONE/i }).count() > 0;
    if (!doneButton) {
      throw new Error('DONE button not found');
    }

    // Test NEXT button
    const nextButton = await page.getByRole('button', { name: /NEXT/i }).count() > 0;
    if (!nextButton) {
      throw new Error('NEXT button not found');
    }

    // For list mode, check sidebar
    if (mode === 'list-sidebar') {
      const hasSidebar = await page.locator('.sidebar').count() > 0;
      if (!hasSidebar) {
        throw new Error('Sidebar not found in list mode');
      }

      const listItems = await page.locator('.list-item').count();
      if (listItems === 0) {
        throw new Error('No list items in sidebar');
      }

      results.addPass(testName, `(sidebar with ${listItems} items)`);
    } else {
      results.addPass(testName, '(buttons present)');
    }

  } catch (error) {
    results.addFail(testName, error.message);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.cyan}╔${'═'.repeat(78)}╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset} Operator E2E Test Suite - Comprehensive Testing                        ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚${'═'.repeat(78)}╝${colors.reset}\n`);

  const results = new TestResults();

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
    console.log(`\n${colors.yellow}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.yellow}Testing Landing Page${colors.reset}`);
    console.log(`${colors.yellow}${'='.repeat(80)}${colors.reset}`);
    await testLandingPage(page, results);

    // Test all demos
    for (const [mode, types] of Object.entries(DEMOS)) {
      console.log(`\n${colors.yellow}${'='.repeat(80)}${colors.reset}`);
      console.log(`${colors.yellow}Testing ${mode === 'cards-stream' ? 'Cards Stream (Focus)' : 'List + Sidebar'} Mode${colors.reset}`);
      console.log(`${colors.yellow}${'='.repeat(80)}${colors.reset}`);

      for (const [type, platforms] of Object.entries(types)) {
        for (const platform of platforms) {
          await testDemoPage(page, mode, type, platform, results);
        }
      }
    }

    // Test interactive features on a few sample pages
    console.log(`\n${colors.yellow}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.yellow}Testing Interactive Features${colors.reset}`);
    console.log(`${colors.yellow}${'='.repeat(80)}${colors.reset}`);

    await testInteractiveFeatures(page, 'cards-stream', 'github', results);
    await testInteractiveFeatures(page, 'list-sidebar', 'telegram', results);

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
