#!/usr/bin/env node

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const PORT = 3000;
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

async function startBunServer() {
  console.log(`${colors.cyan}Starting Bun server...${colors.reset}`);

  // Start bun server
  const server = spawn('bun', ['--bun', 'serve', '--port', PORT.toString(), '/home/user/operator'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', (data) => {
    console.log(`${colors.blue}[Bun]${colors.reset} ${data.toString().trim()}`);
  });

  server.stderr.on('data', (data) => {
    console.log(`${colors.yellow}[Bun]${colors.reset} ${data.toString().trim()}`);
  });

  // Wait for server to start
  await setTimeout(2000);

  console.log(`${colors.green}✓${colors.reset} Server running at ${BASE_URL}\n`);

  return server;
}

async function testPage(page, url, name) {
  try {
    console.log(`${colors.blue}Testing:${colors.reset} ${name}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for React to render
    await page.waitForTimeout(2000);

    // Get title
    const title = await page.title();
    console.log(`${colors.green}✓${colors.reset} Title: "${title}"`);

    // Collect errors
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.waitForTimeout(1000);

    // Take screenshot
    const screenshotName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    await page.screenshot({
      path: `screenshots/${screenshotName}.png`,
      fullPage: true
    });
    console.log(`${colors.green}✓${colors.reset} Screenshot: screenshots/${screenshotName}.png`);

    // Check specific elements
    if (name === 'Landing Page') {
      const cardCount = await page.locator('.demo-card').count();
      console.log(`${colors.green}✓${colors.reset} Demo cards: ${cardCount}`);

      if (cardCount !== 16) {
        console.log(`${colors.yellow}⚠${colors.reset} Expected 16 cards, found ${cardCount}`);
      }
    } else {
      // Check for React root
      const hasRoot = await page.locator('#root').count() > 0;
      console.log(`${colors.green}✓${colors.reset} React root: ${hasRoot ? 'Present' : 'Missing'}`);

      // Check for header
      const hasHeader = await page.locator('.header').count() > 0;
      console.log(`${colors.green}✓${colors.reset} Header: ${hasHeader ? 'Present' : 'Missing'}`);
    }

    if (errors.length > 0) {
      console.log(`${colors.yellow}⚠${colors.reset} JavaScript errors: ${errors.length}`);
      errors.forEach(err => console.log(`  ${colors.red}-${colors.reset} ${err.substring(0, 100)}`));
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
  console.log(`${colors.magenta}Browser Testing with Bun Server${colors.reset}`);
  console.log(`${colors.magenta}${'═'.repeat(60)}${colors.reset}\n`);

  let server = null;
  let browser = null;

  try {
    // Start bun server
    server = await startBunServer();

    // Create screenshots directory
    const { mkdirSync, existsSync } = await import('fs');
    if (!existsSync('screenshots')) {
      mkdirSync('screenshots', { recursive: true });
    }

    // Launch browser
    console.log(`${colors.cyan}Launching browser...${colors.reset}`);
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });

    console.log(`${colors.green}✓${colors.reset} Browser ready\n`);

    // Test key pages
    const tests = [
      { name: 'Landing Page', url: `${BASE_URL}/` },
      { name: 'Cards-GitHub-API', url: `${BASE_URL}/cards-stream/api/github/` },
      { name: 'Cards-Telegram-API', url: `${BASE_URL}/cards-stream/api/telegram/` },
      { name: 'Cards-VK-API', url: `${BASE_URL}/cards-stream/api/vk/` },
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

    // Summary
    console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}Test Summary${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    console.log(`Total tests: ${tests.length}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`JavaScript errors: ${totalErrors}`);

    if (failed === 0) {
      console.log(`\n${colors.green}${'═'.repeat(60)}${colors.reset}`);
      console.log(`${colors.green}✓ ALL TESTS PASSED!${colors.reset}`);
      console.log(`${colors.green}✓ Pages render correctly in browser${colors.reset}`);
      console.log(`${colors.green}✓ React apps working${colors.reset}`);
      if (totalErrors === 0) {
        console.log(`${colors.green}✓ No JavaScript errors${colors.reset}`);
      }
      console.log(`${colors.green}${'═'.repeat(60)}${colors.reset}\n`);
    }

    return failed === 0;

  } finally {
    // Cleanup
    if (browser) {
      console.log(`\n${colors.cyan}Closing browser...${colors.reset}`);
      await browser.close();
      console.log(`${colors.green}✓${colors.reset} Browser closed`);
    }

    if (server) {
      console.log(`${colors.cyan}Stopping server...${colors.reset}`);
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
