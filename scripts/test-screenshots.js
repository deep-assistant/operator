#!/usr/bin/env node

import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const BASE_URL = 'https://deep-assistant.github.io/operator/';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function captureAllScreenshots() {
  console.log(`${colors.cyan}Capturing Screenshots of All Demo Pages${colors.reset}\n`);

  if (!existsSync('screenshots')) {
    mkdirSync('screenshots', { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const screenshots = [];
  let successCount = 0;
  let failCount = 0;

  async function capture(url, name, description) {
    try {
      console.log(`${colors.blue}Capturing:${colors.reset} ${name}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);

      const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const screenshotPath = `screenshots/${safeName}.png`;

      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`${colors.green}✓${colors.reset} Saved to ${screenshotPath}`);

      screenshots.push({
        name,
        description,
        url,
        path: screenshotPath,
        timestamp: new Date().toISOString()
      });

      successCount++;
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} Failed: ${error.message}`);
      failCount++;
    }
  }

  try {
    // Landing page
    await capture(BASE_URL, 'Landing Page', 'Main demo selection page');

    // Cards Stream demos
    console.log(`\n${colors.yellow}Cards Stream Mode${colors.reset}`);
    await capture(`${BASE_URL}cards-stream/api/github/`, 'Cards-Stream-API-GitHub', 'GitHub issues/PRs with API');
    await capture(`${BASE_URL}cards-stream/api/telegram/`, 'Cards-Stream-API-Telegram', 'Telegram messages with API');
    await capture(`${BASE_URL}cards-stream/api/vk/`, 'Cards-Stream-API-VK', 'VK messages with API');
    await capture(`${BASE_URL}cards-stream/api/x/`, 'Cards-Stream-API-X', 'X DMs with API');
    await capture(`${BASE_URL}cards-stream/iframe/github/`, 'Cards-Stream-IFRAME-GitHub', 'GitHub with embedded interface');
    await capture(`${BASE_URL}cards-stream/iframe/telegram/`, 'Cards-Stream-IFRAME-Telegram', 'Telegram with embedded interface');
    await capture(`${BASE_URL}cards-stream/iframe/vk/`, 'Cards-Stream-IFRAME-VK', 'VK with embedded interface');
    await capture(`${BASE_URL}cards-stream/iframe/x/`, 'Cards-Stream-IFRAME-X', 'X with embedded interface');

    // List + Sidebar demos
    console.log(`\n${colors.yellow}List + Sidebar Mode${colors.reset}`);
    await capture(`${BASE_URL}list-sidebar/api/github/`, 'List-Sidebar-API-GitHub', 'GitHub issues/PRs with API');
    await capture(`${BASE_URL}list-sidebar/api/telegram/`, 'List-Sidebar-API-Telegram', 'Telegram messages with API');
    await capture(`${BASE_URL}list-sidebar/api/vk/`, 'List-Sidebar-API-VK', 'VK messages with API');
    await capture(`${BASE_URL}list-sidebar/api/x/`, 'List-Sidebar-API-X', 'X DMs with API');
    await capture(`${BASE_URL}list-sidebar/iframe/github/`, 'List-Sidebar-IFRAME-GitHub', 'GitHub with embedded interface');
    await capture(`${BASE_URL}list-sidebar/iframe/telegram/`, 'List-Sidebar-IFRAME-Telegram', 'Telegram with embedded interface');
    await capture(`${BASE_URL}list-sidebar/iframe/vk/`, 'List-Sidebar-IFRAME-VK', 'VK with embedded interface');
    await capture(`${BASE_URL}list-sidebar/iframe/x/`, 'List-Sidebar-IFRAME-X', 'X with embedded interface');

    // Generate index HTML for easy viewing
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Operator Screenshots</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #0f172a;
      color: #f8fafc;
    }
    h1 { color: #2563eb; margin-bottom: 2rem; }
    .screenshot {
      margin-bottom: 3rem;
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #334155;
    }
    .screenshot h2 {
      margin-top: 0;
      color: #f8fafc;
    }
    .screenshot p {
      color: #94a3b8;
      margin: 0.5rem 0;
    }
    .screenshot img {
      max-width: 100%;
      border: 1px solid #334155;
      border-radius: 0.25rem;
      margin-top: 1rem;
    }
    .meta {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.5rem;
    }
    .stats {
      background: #1e293b;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
      border: 1px solid #334155;
    }
  </style>
</head>
<body>
  <h1>Operator Demo Screenshots</h1>
  <div class="stats">
    <p><strong>Total Screenshots:</strong> ${screenshots.length}</p>
    <p><strong>Success:</strong> ${successCount} | <strong>Failed:</strong> ${failCount}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  </div>
  ${screenshots.map(s => `
    <div class="screenshot">
      <h2>${s.name}</h2>
      <p>${s.description}</p>
      <p class="meta">URL: <a href="${s.url}" target="_blank" style="color: #2563eb;">${s.url}</a></p>
      <img src="${s.path.replace('screenshots/', '')}" alt="${s.name}" />
    </div>
  `).join('\n')}
</body>
</html>`;

    writeFileSync('screenshots/index.html', indexHtml);
    console.log(`\n${colors.green}✓${colors.reset} Generated screenshots/index.html`);

    console.log(`\n${colors.green}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}Screenshot Capture Complete${colors.reset}`);
    console.log(`${colors.green}Success: ${successCount} | Failed: ${failCount}${colors.reset}`);
    console.log(`${colors.green}View results: screenshots/index.html${colors.reset}`);
    console.log(`${colors.green}${'═'.repeat(60)}${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureAllScreenshots().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
