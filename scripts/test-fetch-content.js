#!/usr/bin/env node

const BASE_URL = 'https://deep-assistant.github.io/operator/';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testFetchContent() {
  console.log(`${colors.cyan}Fetching Live Site Content${colors.reset}\n`);

  const testUrls = [
    { name: 'Landing Page', url: BASE_URL },
    { name: 'Cards-GitHub-API', url: `${BASE_URL}cards-stream/api/github/` },
    { name: 'List-GitHub-API', url: `${BASE_URL}list-sidebar/api/github/` }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testUrls) {
    try {
      console.log(`${colors.blue}Testing:${colors.reset} ${test.name}`);
      console.log(`${colors.blue}URL:${colors.reset} ${test.url}`);

      const response = await fetch(test.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Basic validation
      const hasDoctype = html.includes('<!DOCTYPE html>');
      const hasTitle = /<title>([^<]+)<\/title>/.test(html);
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'No title';

      console.log(`${colors.green}✓${colors.reset} Status: ${response.status}`);
      console.log(`${colors.green}✓${colors.reset} Title: "${title}"`);
      console.log(`${colors.green}✓${colors.reset} Size: ${(html.length / 1024).toFixed(2)} KB`);
      console.log(`${colors.green}✓${colors.reset} Has DOCTYPE: ${hasDoctype}`);
      console.log(`${colors.green}✓${colors.reset} Has Title: ${hasTitle}`);

      // Check for React
      const hasReact = html.includes('react') || html.includes('React');
      console.log(`${colors.green}✓${colors.reset} Has React: ${hasReact}`);

      // Check for our shared CSS
      const hasCss = html.includes('operator.css');
      console.log(`${colors.green}✓${colors.reset} Has CSS: ${hasCss}`);

      // Check for our components
      const hasComponents = html.includes('ui-components.js');
      console.log(`${colors.green}✓${colors.reset} Has Components: ${hasComponents}`);

      passed++;
      console.log(`${colors.green}PASS${colors.reset}\n`);

    } catch (error) {
      failed++;
      console.log(`${colors.red}✗ Error:${colors.reset} ${error.message}\n`);
    }
  }

  console.log(`${'═'.repeat(60)}`);
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Total:  ${testUrls.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${'═'.repeat(60)}\n`);

  return failed === 0;
}

testFetchContent()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
