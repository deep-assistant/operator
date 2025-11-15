#!/usr/bin/env node

import { chromium } from 'playwright';
import { readFileSync, existsSync, mkdirSync } from 'fs';

const BASE_URL = 'https://deep-assistant.github.io/operator/';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  laptop: { width: 1366, height: 768, name: 'Laptop' },
  tablet: { width: 768, height: 1024, name: 'Tablet' },
  mobile: { width: 375, height: 667, name: 'Mobile' }
};

async function captureVisualTest(page, url, name, viewport) {
  try {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const viewportName = viewport.name.toLowerCase();
    const screenshotPath = `screenshots/visual/${safeName}-${viewportName}.png`;

    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`${colors.green}✓${colors.reset} ${name} @ ${viewport.name} (${viewport.width}x${viewport.height})`);

    return { success: true, path: screenshotPath };
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name} @ ${viewport.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function analyzePageLayout(page, url, name) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const analysis = await page.evaluate(() => {
      const results = {
        title: document.title,
        hasBody: !!document.body,
        bodyHasContent: document.body?.textContent?.trim().length > 0,
        elementCounts: {
          divs: document.querySelectorAll('div').length,
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          links: document.querySelectorAll('a').length,
          images: document.querySelectorAll('img').length,
          scripts: document.querySelectorAll('script').length
        },
        cssVariables: [],
        colors: new Set()
      };

      // Extract CSS custom properties
      const computedStyle = getComputedStyle(document.documentElement);
      for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle[i];
        if (prop.startsWith('--')) {
          results.cssVariables.push({
            name: prop,
            value: computedStyle.getPropertyValue(prop).trim()
          });
        }
      }

      // Extract unique colors
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const style = getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        if (color && color !== 'rgba(0, 0, 0, 0)') results.colors.add(color);
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') results.colors.add(bgColor);
      });

      results.colors = Array.from(results.colors);
      return results;
    });

    console.log(`\n${colors.cyan}Layout Analysis: ${name}${colors.reset}`);
    console.log(`  Title: ${analysis.title}`);
    console.log(`  Elements:`);
    console.log(`    - Divs: ${analysis.elementCounts.divs}`);
    console.log(`    - Buttons: ${analysis.elementCounts.buttons}`);
    console.log(`    - Inputs: ${analysis.elementCounts.inputs}`);
    console.log(`    - Links: ${analysis.elementCounts.links}`);
    console.log(`    - Images: ${analysis.elementCounts.images}`);
    console.log(`  CSS Variables: ${analysis.cssVariables.length}`);
    console.log(`  Unique Colors: ${analysis.colors.length}`);

    return analysis;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Analysis failed for ${name}: ${error.message}`);
    return null;
  }
}

async function runVisualTests() {
  console.log(`${colors.magenta}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.magenta}║${colors.reset} Visual Testing & Screenshot Capture                      ${colors.magenta}║${colors.reset}`);
  console.log(`${colors.magenta}╚${'═'.repeat(58)}╝${colors.reset}\n`);

  // Create directories
  if (!existsSync('screenshots')) {
    mkdirSync('screenshots', { recursive: true });
  }
  if (!existsSync('screenshots/visual')) {
    mkdirSync('screenshots/visual', { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const testPages = [
    { name: 'Landing Page', url: BASE_URL },
    { name: 'Cards-API-GitHub', url: `${BASE_URL}cards-stream/api/github/` },
    { name: 'Cards-API-Telegram', url: `${BASE_URL}cards-stream/api/telegram/` },
    { name: 'Cards-API-VK', url: `${BASE_URL}cards-stream/api/vk/` },
    { name: 'Cards-API-X', url: `${BASE_URL}cards-stream/api/x/` },
    { name: 'Cards-IFRAME-GitHub', url: `${BASE_URL}cards-stream/iframe/github/` },
    { name: 'Cards-IFRAME-Telegram', url: `${BASE_URL}cards-stream/iframe/telegram/` },
    { name: 'Cards-IFRAME-VK', url: `${BASE_URL}cards-stream/iframe/vk/` },
    { name: 'Cards-IFRAME-X', url: `${BASE_URL}cards-stream/iframe/x/` },
    { name: 'List-API-GitHub', url: `${BASE_URL}list-sidebar/api/github/` },
    { name: 'List-API-Telegram', url: `${BASE_URL}list-sidebar/api/telegram/` },
    { name: 'List-API-VK', url: `${BASE_URL}list-sidebar/api/vk/` },
    { name: 'List-API-X', url: `${BASE_URL}list-sidebar/api/x/` },
    { name: 'List-IFRAME-GitHub', url: `${BASE_URL}list-sidebar/iframe/github/` },
    { name: 'List-IFRAME-Telegram', url: `${BASE_URL}list-sidebar/iframe/telegram/` },
    { name: 'List-IFRAME-VK', url: `${BASE_URL}list-sidebar/iframe/vk/` },
    { name: 'List-IFRAME-X', url: `${BASE_URL}list-sidebar/iframe/x/` }
  ];

  try {
    let totalTests = 0;
    let passedTests = 0;

    // Capture screenshots for all viewports
    console.log(`${colors.yellow}Capturing Screenshots Across Viewports${colors.reset}`);
    console.log('─'.repeat(60));

    for (const testPage of testPages) {
      console.log(`\n${colors.blue}${testPage.name}${colors.reset}`);

      for (const [key, viewport] of Object.entries(VIEWPORTS)) {
        totalTests++;
        const result = await captureVisualTest(page, testPage.url, testPage.name, viewport);
        if (result.success) passedTests++;
      }
    }

    // Analyze layout of key pages
    console.log(`\n\n${colors.yellow}Layout Analysis${colors.reset}`);
    console.log('─'.repeat(60));

    await analyzePageLayout(page, BASE_URL, 'Landing Page');
    await analyzePageLayout(page, `${BASE_URL}cards-stream/api/github/`, 'Cards Stream');
    await analyzePageLayout(page, `${BASE_URL}list-sidebar/api/github/`, 'List Sidebar');

    console.log(`\n${colors.green}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}Visual Testing Complete${colors.reset}`);
    console.log(`${colors.green}Total screenshots: ${passedTests}/${totalTests}${colors.reset}`);
    console.log(`${colors.green}${'═'.repeat(60)}${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVisualTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
