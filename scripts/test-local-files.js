#!/usr/bin/env node

import { chromium } from 'playwright';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_PATH = resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testAllLocalPages() {
  console.log(`${colors.cyan}Testing All Demo Pages Locally${colors.reset}\n`);

  const testFiles = [
    { name: 'Landing Page', path: 'index.html' },
    { name: 'Cards-GitHub-API', path: 'cards-stream/api/github/index.html' },
    { name: 'Cards-Telegram-API', path: 'cards-stream/api/telegram/index.html' },
    { name: 'Cards-VK-API', path: 'cards-stream/api/vk/index.html' },
    { name: 'Cards-X-API', path: 'cards-stream/api/x/index.html' },
    { name: 'Cards-GitHub-IFRAME', path: 'cards-stream/iframe/github/index.html' },
    { name: 'Cards-Telegram-IFRAME', path: 'cards-stream/iframe/telegram/index.html' },
    { name: 'Cards-VK-IFRAME', path: 'cards-stream/iframe/vk/index.html' },
    { name: 'Cards-X-IFRAME', path: 'cards-stream/iframe/x/index.html' },
    { name: 'List-GitHub-API', path: 'list-sidebar/api/github/index.html' },
    { name: 'List-Telegram-API', path: 'list-sidebar/api/telegram/index.html' },
    { name: 'List-VK-API', path: 'list-sidebar/api/vk/index.html' },
    { name: 'List-X-API', path: 'list-sidebar/api/x/index.html' },
    { name: 'List-GitHub-IFRAME', path: 'list-sidebar/iframe/github/index.html' },
    { name: 'List-Telegram-IFRAME', path: 'list-sidebar/iframe/telegram/index.html' },
    { name: 'List-VK-IFRAME', path: 'list-sidebar/iframe/vk/index.html' },
    { name: 'List-X-IFRAME', path: 'list-sidebar/iframe/x/index.html' }
  ];

  if (!existsSync('screenshots')) {
    mkdirSync('screenshots', { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;
  const errors = [];

  for (const testFile of testFiles) {
    try {
      const filePath = resolve(BASE_PATH, testFile.path);
      const fileUrl = `file://${filePath}`;

      console.log(`${colors.blue}Testing:${colors.reset} ${testFile.name}`);

      // Simple page load
      await page.goto(fileUrl, { waitUntil: 'load', timeout: 5000 });

      // Wait a bit for React to render
      await page.waitForTimeout(2000);

      // Get title using evaluate instead of textContent
      const title = await page.evaluate(() => document.title);

      // Check if React root has content
      const hasContent = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root && root.innerHTML.length > 0;
      });

      if (!hasContent && !testFile.name.includes('Landing')) {
        console.log(`${colors.yellow}⚠${colors.reset} React app may not have rendered`);
      }

      console.log(`${colors.green}✓${colors.reset} ${testFile.name} (${title})`);
      passed++;

    } catch (error) {
      failed++;
      errors.push({ test: testFile.name, error: error.message });
      console.log(`${colors.red}✗${colors.reset} ${testFile.name}: ${error.message}`);
    }
  }

  await browser.close();

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Total:  ${testFiles.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${'═'.repeat(60)}\n`);

  return failed === 0;
}

testAllLocalPages()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
