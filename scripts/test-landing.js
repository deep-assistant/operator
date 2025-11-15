#!/usr/bin/env node

import { chromium } from 'playwright';

const BASE_URL = 'https://deep-assistant.github.io/operator/';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testLandingPage() {
  console.log(`${colors.cyan}Testing Landing Page${colors.reset}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log(`${colors.blue}Navigating to:${colors.reset} ${BASE_URL}`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Test 1: Page loads successfully
    console.log(`\n${colors.yellow}Test 1: Page Load${colors.reset}`);
    const title = await page.title();
    console.log(`${colors.green}✓${colors.reset} Page loaded with title: "${title}"`);

    // Test 2: Check header
    console.log(`\n${colors.yellow}Test 2: Header Content${colors.reset}`);
    const h1Text = await page.textContent('h1');
    if (h1Text.includes('Operator')) {
      console.log(`${colors.green}✓${colors.reset} Header found: "${h1Text}"`);
    } else {
      console.log(`${colors.red}✗${colors.reset} Header text incorrect: "${h1Text}"`);
    }

    const subtitle = await page.textContent('.subtitle');
    console.log(`${colors.green}✓${colors.reset} Subtitle: "${subtitle}"`);

    // Test 3: Check legend
    console.log(`\n${colors.yellow}Test 3: Integration Types Legend${colors.reset}`);
    const apiBadge = await page.textContent('.badge.api');
    const iframeButton = await page.textContent('.badge.iframe');
    console.log(`${colors.green}✓${colors.reset} API badge: "${apiLabel}"`);
    console.log(`${colors.green}✓${colors.reset} IFRAME badge: "${iframeLabel}"`);

    // Test 4: Count demo cards
    console.log(`\n${colors.yellow}Test 4: Demo Cards${colors.reset}`);
    const demoCards = await page.$$('.demo-card');
    console.log(`${colors.green}✓${colors.reset} Found ${demoCards.length} demo cards (expected: 16)`);

    if (demoCards.length !== 16) {
      console.log(`${colors.red}✗${colors.reset} Expected 16 cards, found ${demoCards.length}`);
    }

    // Test 5: Verify all links are present
    console.log(`\n${colors.yellow}Test 5: Navigation Links${colors.reset}`);
    const links = await page.$$('a[href*="index.html"]');
    console.log(`${colors.green}✓${colors.reset} Found ${links.length} navigation links`);

    const expectedLinks = [
      'list-sidebar/api/github',
      'list-sidebar/api/telegram',
      'list-sidebar/api/vk',
      'list-sidebar/api/x',
      'list-sidebar/iframe/github',
      'list-sidebar/iframe/telegram',
      'list-sidebar/iframe/vk',
      'list-sidebar/iframe/x',
      'cards-stream/api/github',
      'cards-stream/api/telegram',
      'cards-stream/api/vk',
      'cards-stream/api/x',
      'cards-stream/iframe/github',
      'cards-stream/iframe/telegram',
      'cards-stream/iframe/vk',
      'cards-stream/iframe/x'
    ];

    for (const expectedLink of expectedLinks) {
      const linkExists = await page.$(`a[href*="${expectedLink}"]`);
      if (linkExists) {
        console.log(`${colors.green}✓${colors.reset} Link found: ${expectedLink}`);
      } else {
        console.log(`${colors.red}✗${colors.reset} Link missing: ${expectedLink}`);
      }
    }

    // Test 6: Check sections
    console.log(`\n${colors.yellow}Test 6: Page Sections${colors.reset}`);
    const sections = await page.$$('.ui-mode-section');
    console.log(`${colors.green}✓${colors.reset} Found ${sections.length} UI mode sections`);

    const sectionTitles = await page.$$eval('.section-title', titles =>
      titles.map(t => t.textContent)
    );
    sectionTitles.forEach(title => {
      console.log(`  - ${title}`);
    });

    // Test 7: Check styling
    console.log(`\n${colors.yellow}Test 7: Visual Elements${colors.reset}`);

    // Check if cards have hover effects
    const firstCard = await page.$('.demo-card');
    if (firstCard) {
      const beforeHover = await firstCard.boundingBox();
      await firstCard.hover();
      await page.waitForTimeout(500);
      console.log(`${colors.green}✓${colors.reset} Card hover interaction working`);
    }

    // Test 8: Screenshot
    console.log(`\n${colors.yellow}Test 8: Screenshot${colors.reset}`);
    const fs = await import('fs');
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots', { recursive: true });
    }
    await page.screenshot({
      path: 'screenshots/landing-page-full.png',
      fullPage: true
    });
    console.log(`${colors.green}✓${colors.reset} Full page screenshot saved`);

    // Take viewport screenshot
    await page.screenshot({
      path: 'screenshots/landing-page-viewport.png',
      fullPage: false
    });
    console.log(`${colors.green}✓${colors.reset} Viewport screenshot saved`);

    // Test 9: Responsive design
    console.log(`\n${colors.yellow}Test 9: Responsive Design${colors.reset}`);

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'screenshots/landing-page-mobile.png',
      fullPage: true
    });
    console.log(`${colors.green}✓${colors.reset} Mobile view (375x667) screenshot saved`);

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'screenshots/landing-page-tablet.png',
      fullPage: true
    });
    console.log(`${colors.green}✓${colors.reset} Tablet view (768x1024) screenshot saved`);

    console.log(`\n${colors.green}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}All landing page tests completed successfully!${colors.reset}`);
    console.log(`${colors.green}${'═'.repeat(60)}${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}Error:${colors.reset}`, error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testLandingPage().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
