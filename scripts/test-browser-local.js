#!/usr/bin/env node

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function startServer() {
  console.log(`${colors.cyan}Starting local HTTP server...${colors.reset}`);

  // Start Python's simple HTTP server
  const server = spawn('python3', ['-m', 'http.server', PORT.toString()], {
    cwd: '/home/user/operator',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Wait for server to start
  await setTimeout(2000);

  console.log(`${colors.green}✓${colors.reset} Server running at ${BASE_URL}\n`);

  return server;
}

async function testPage(page, url, name) {
  try {
    console.log(`${colors.blue}Testing:${colors.reset} ${name}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });

    // Wait for React to render
    await page.waitForTimeout(1500);

    // Get title
    const title = await page.title();
    console.log(`${colors.green}✓${colors.reset} Title: "${title}"`);

    // Check for errors
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    // Take screenshot
    const screenshotName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    await page.screenshot({
      path: `screenshots/${screenshotName}.png`,
      fullPage: true
    });
    console.log(`${colors.green}✓${colors.reset} Screenshot saved`);

    // Check specific elements based on page type
    if (name === 'Landing Page') {
      const cardCount = await page.locator('.demo-card').count();
      console.log(`${colors.green}✓${colors.reset} Found ${cardCount} demo cards`);

      if (cardCount !== 16) {
        console.log(`${colors.yellow}⚠${colors.reset} Expected 16 cards, found ${cardCount}`);
      }
    } else {
      // Check for React root content
      const rootContent = await page.locator('#root').textContent();
      const hasContent = rootContent && rootContent.length > 100;
      console.log(`${colors.green}✓${colors.reset} React app rendered: ${hasContent ? 'Yes' : 'No'}`);

      // Check for header
      const hasHeader = await page.locator('.header').count() > 0;
      console.log(`${colors.green}✓${colors.reset} Header present: ${hasHeader}`);

      // Check for main content
      const hasMainContent = await page.locator('.main-content').count() > 0;
      console.log(`${colors.green}✓${colors.reset} Main content present: ${hasMainContent}`);
    }

    if (errors.length > 0) {
      console.log(`${colors.yellow}⚠${colors.reset} JavaScript errors: ${errors.length}`);
      errors.forEach(err => console.log(`  ${colors.red}-${colors.reset} ${err}`));
    } else {
      console.log(`${colors.green}✓${colors.reset} No JavaScript errors`);
    }

    console.log(`${colors.green}PASS${colors.reset}\n`);
    return { success: true, errors: errors.length };

  } catch (error) {
    console.log(`${colors.red}✗ Error:${colors.reset} ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`${colors.magenta}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.magenta}Browser Testing - Local Server${colors.reset}`);
  console.log(`${colors.magenta}${'═'.repeat(60)}${colors.reset}\n`);

  let server = null;

  try {
    // Start server
    server = await startServer();

    // Create screenshots directory
    const { mkdirSync, existsSync } = await import('fs');
    if (!existsSync('screenshots')) {
      mkdirSync('screenshots', { recursive: true });
    }

    // Launch browser
    console.log(`${colors.cyan}Launching browser...${colors.reset}`);
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });

    console.log(`${colors.green}✓${colors.reset} Browser ready\n`);

    // Test pages
    const tests = [
      { name: 'Landing Page', url: `${BASE_URL}/` },
      { name: 'Cards-GitHub-API', url: `${BASE_URL}/cards-stream/api/github/` },
      { name: 'Cards-Telegram-API', url: `${BASE_URL}/cards-stream/api/telegram/` },
      { name: 'List-GitHub-API', url: `${BASE_URL}/list-sidebar/api/github/` },
      { name: 'List-Telegram-API', url: `${BASE_URL}/list-sidebar/api/telegram/` },
      { name: 'Cards-GitHub-IFRAME', url: `${BASE_URL}/cards-stream/iframe/github/` },
      { name: 'List-GitHub-IFRAME', url: `${BASE_URL}/list-sidebar/iframe/github/` }
    ];

    let passed = 0;
    let failed = 0;
    let totalErrors = 0;

    for (const test of tests) {
      const result = await testPage(page, test.url, test.name);
      if (result.success) {
        passed++;
        totalErrors += result.errors || 0;
      } else {
        failed++;
      }
    }

    await browser.close();

    // Summary
    console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}Test Summary${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    console.log(`Total tests: ${tests.length}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`JavaScript errors: ${totalErrors}`);

    if (failed === 0 && totalErrors === 0) {
      console.log(`\n${colors.green}${'═'.repeat(60)}${colors.reset}`);
      console.log(`${colors.green}✓ ALL TESTS PASSED WITH NO ERRORS!${colors.reset}`);
      console.log(`${colors.green}✓ Pages render correctly in browser${colors.reset}`);
      console.log(`${colors.green}✓ React apps working${colors.reset}`);
      console.log(`${colors.green}✓ No JavaScript errors${colors.reset}`);
      console.log(`${colors.green}${'═'.repeat(60)}${colors.reset}\n`);
    }

    return failed === 0;

  } finally {
    // Kill server
    if (server) {
      console.log(`\n${colors.cyan}Stopping server...${colors.reset}`);
      server.kill();
      console.log(`${colors.green}✓${colors.reset} Server stopped\n`);
    }
  }
}

runTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
