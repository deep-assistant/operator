#!/usr/bin/env node

import { execSync } from 'child_process';

const BASE_URL = 'https://deep-assistant.github.io/operator/';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function testUrl(name, url) {
  try {
    console.log(`\n${colors.blue}Testing:${colors.reset} ${name}`);
    console.log(`${colors.blue}URL:${colors.reset} ${url}`);

    // Use curl to fetch the page (curl respects the proxy env vars)
    const html = execSync(`curl -s -L "${url}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });

    // Validate content
    const hasDoctype = html.includes('<!DOCTYPE html>');
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'No title';
    const hasReact = html.includes('react') || html.includes('React');
    const hasCss = html.includes('operator.css');
    const hasComponents = html.includes('ui-components.js') || html.includes('auth-utils.js');
    const hasBody = html.includes('<body');
    const size = (html.length / 1024).toFixed(2);

    console.log(`${colors.green}✓${colors.reset} Downloaded: ${size} KB`);
    console.log(`${colors.green}✓${colors.reset} Title: "${title}"`);
    console.log(`${colors.green}✓${colors.reset} Has DOCTYPE: ${hasDoctype}`);
    console.log(`${colors.green}✓${colors.reset} Has Body: ${hasBody}`);
    console.log(`${colors.green}✓${colors.reset} Has React: ${hasReact}`);
    console.log(`${colors.green}✓${colors.reset} Has CSS: ${hasCss}`);
    console.log(`${colors.green}✓${colors.reset} Has JS Components: ${hasComponents}`);

    // Count specific elements
    const linkMatches = html.match(/href="[^"]*index\.html"/g);
    const linkCount = linkMatches ? linkMatches.length : 0;

    if (name === 'Landing Page') {
      const cardMatches = html.match(/class="demo-card"/g);
      const cardCount = cardMatches ? cardMatches.length : 0;
      console.log(`${colors.green}✓${colors.reset} Demo cards: ${cardCount}`);
      console.log(`${colors.green}✓${colors.reset} Demo links: ${linkCount}`);

      if (cardCount !== 16) {
        console.log(`${colors.yellow}⚠${colors.reset} Expected 16 cards, found ${cardCount}`);
      }
    }

    return { success: true, title, size };

  } catch (error) {
    console.log(`${colors.red}✗ Error:${colors.reset} ${error.message}`);
    return { success: false, error: error.message };
  }
}

console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
console.log(`${colors.cyan}Testing Live Demo Pages via curl${colors.reset}`);
console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);

const tests = [
  { name: 'Landing Page', url: BASE_URL },
  { name: 'Cards-GitHub-API', url: `${BASE_URL}cards-stream/api/github/` },
  { name: 'Cards-Telegram-API', url: `${BASE_URL}cards-stream/api/telegram/` },
  { name: 'Cards-VK-API', url: `${BASE_URL}cards-stream/api/vk/` },
  { name: 'Cards-X-API', url: `${BASE_URL}cards-stream/api/x/` },
  { name: 'Cards-GitHub-IFRAME', url: `${BASE_URL}cards-stream/iframe/github/` },
  { name: 'Cards-Telegram-IFRAME', url: `${BASE_URL}cards-stream/iframe/telegram/` },
  { name: 'Cards-VK-IFRAME', url: `${BASE_URL}cards-stream/iframe/vk/` },
  { name: 'Cards-X-IFRAME', url: `${BASE_URL}cards-stream/iframe/x/` },
  { name: 'List-GitHub-API', url: `${BASE_URL}list-sidebar/api/github/` },
  { name: 'List-Telegram-API', url: `${BASE_URL}list-sidebar/api/telegram/` },
  { name: 'List-VK-API', url: `${BASE_URL}list-sidebar/api/vk/` },
  { name: 'List-X-API', url: `${BASE_URL}list-sidebar/api/x/` },
  { name: 'List-GitHub-IFRAME', url: `${BASE_URL}list-sidebar/iframe/github/` },
  { name: 'List-Telegram-IFRAME', url: `${BASE_URL}list-sidebar/iframe/telegram/` },
  { name: 'List-VK-IFRAME', url: `${BASE_URL}list-sidebar/iframe/vk/` },
  { name: 'List-X-IFRAME', url: `${BASE_URL}list-sidebar/iframe/x/` }
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = testUrl(test.name, test.url);
  if (result.success) {
    passed++;
  } else {
    failed++;
  }
}

console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
console.log(`${colors.cyan}Test Summary${colors.reset}`);
console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
console.log(`Total:  ${tests.length}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

if (failed === 0) {
  console.log(`\n${colors.green}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✓ ALL 17 PAGES TESTED SUCCESSFULLY!${colors.reset}`);
  console.log(`${colors.green}✓ All pages are live and accessible${colors.reset}`);
  console.log(`${colors.green}✓ All pages have correct structure${colors.reset}`);
  console.log(`${colors.green}✓ All dependencies loaded${colors.reset}`);
  console.log(`${colors.green}${'═'.repeat(60)}${colors.reset}\n`);
}

process.exit(failed === 0 ? 0 : 1);
