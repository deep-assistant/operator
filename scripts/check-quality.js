#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

class QualityChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
  }

  checkPage(filePath, name, type) {
    const content = readFileSync(filePath, 'utf-8');

    console.log(`\n${colors.cyan}${name}${colors.reset}`);
    console.log('─'.repeat(60));

    const checks = [
      this.checkResponsive(content, name),
      this.checkAccessibility(content, name),
      this.checkSEO(content, name),
      this.checkConsistency(content, name, type),
      this.checkPerformance(content, name),
      this.checkStyling(content, name)
    ];

    let issueCount = 0;
    let warningCount = 0;

    checks.forEach(check => {
      if (check.status === 'error') {
        issueCount++;
        console.log(`  ${colors.red}✗${colors.reset} ${check.message}`);
      } else if (check.status === 'warning') {
        warningCount++;
        console.log(`  ${colors.yellow}⚠${colors.reset} ${check.message}`);
      } else {
        console.log(`  ${colors.green}✓${colors.reset} ${check.message}`);
      }
    });

    if (issueCount === 0 && warningCount === 0) {
      console.log(`${colors.green}${colors.bold}  Perfect! No issues found.${colors.reset}`);
    }

    return { issueCount, warningCount };
  }

  checkResponsive(content, name) {
    const hasViewport = /name="viewport"/i.test(content);
    const hasMediaQueries = /@media/i.test(content);

    if (!hasViewport) {
      return { status: 'error', message: 'Missing viewport meta tag' };
    }

    if (!hasMediaQueries && !name.includes('Landing')) {
      return { status: 'warning', message: 'No media queries found' };
    }

    return { status: 'ok', message: 'Responsive design elements present' };
  }

  checkAccessibility(content, name) {
    const hasLang = /<html[^>]+lang=/i.test(content);
    const hasAltTags = !/<img(?![^>]*alt=)/i.test(content) || !/img/i.test(content);

    if (!hasLang) {
      return { status: 'warning', message: 'Missing lang attribute on <html>' };
    }

    return { status: 'ok', message: 'Accessibility basics in place' };
  }

  checkSEO(content, name) {
    const hasTitle = /<title>[\s\S]+?<\/title>/i.test(content);
    const hasDescription = /name="description"/i.test(content);
    const title = content.match(/<title>([\s\S]+?)<\/title>/i);

    if (!hasTitle || (title && title[1].trim().length === 0)) {
      return { status: 'error', message: 'Missing or empty title tag' };
    }

    if (!hasDescription) {
      return { status: 'warning', message: 'Missing meta description' };
    }

    return { status: 'ok', message: `SEO: Title length ${title[1].length} chars` };
  }

  checkConsistency(content, name, type) {
    const expectedStyles = ['--primary-color', '--background', '--surface'];
    let missingStyles = [];

    expectedStyles.forEach(style => {
      if (!content.includes(style)) {
        missingStyles.push(style);
      }
    });

    if (missingStyles.length > 0) {
      return {
        status: 'warning',
        message: `CSS variables might be missing: ${missingStyles.join(', ')}`
      };
    }

    return { status: 'ok', message: 'Consistent styling approach' };
  }

  checkPerformance(content, name) {
    const scriptCount = (content.match(/<script/gi) || []).length;
    const inlineScriptSize = content.match(/<script[\s\S]*?<\/script>/gi)
      ?.reduce((sum, script) => sum + script.length, 0) || 0;

    const cssSize = content.match(/<style[\s\S]*?<\/style>/gi)
      ?.reduce((sum, style) => sum + style.length, 0) || 0;

    if (inlineScriptSize > 50000) {
      return {
        status: 'warning',
        message: `Large inline script (${(inlineScriptSize / 1024).toFixed(2)} KB)`
      };
    }

    return {
      status: 'ok',
      message: `Scripts: ${scriptCount}, Inline JS: ${(inlineScriptSize / 1024).toFixed(2)} KB`
    };
  }

  checkStyling(content, name) {
    const hasStyles = /<style/i.test(content) || /<link[^>]*rel="stylesheet"/i.test(content);

    if (!hasStyles) {
      return { status: 'warning', message: 'No stylesheets found' };
    }

    // Check for common CSS properties
    const hasBoxModel = /box-sizing/i.test(content);
    const hasFlexOrGrid = /display:\s*(flex|grid)/i.test(content);

    if (hasFlexOrGrid) {
      return { status: 'ok', message: 'Modern CSS (Flexbox/Grid) detected' };
    }

    return { status: 'ok', message: 'Stylesheets present' };
  }
}

async function runQualityChecks() {
  console.log(`${colors.magenta}${colors.bold}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}║${colors.reset} Code Quality & Consistency Check                          ${colors.magenta}${colors.bold}║${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}╚${'═'.repeat(58)}╝${colors.reset}`);

  const checker = new QualityChecker();

  const files = [
    { name: 'Landing Page', path: 'index.html', type: 'landing' },
    { name: 'Cards-GitHub-API', path: 'cards-stream/api/github/index.html', type: 'cards-api' },
    { name: 'Cards-Telegram-API', path: 'cards-stream/api/telegram/index.html', type: 'cards-api' },
    { name: 'Cards-VK-API', path: 'cards-stream/api/vk/index.html', type: 'cards-api' },
    { name: 'Cards-X-API', path: 'cards-stream/api/x/index.html', type: 'cards-api' },
    { name: 'Cards-GitHub-IFRAME', path: 'cards-stream/iframe/github/index.html', type: 'cards-iframe' },
    { name: 'Cards-Telegram-IFRAME', path: 'cards-stream/iframe/telegram/index.html', type: 'cards-iframe' },
    { name: 'Cards-VK-IFRAME', path: 'cards-stream/iframe/vk/index.html', type: 'cards-iframe' },
    { name: 'Cards-X-IFRAME', path: 'cards-stream/iframe/x/index.html', type: 'cards-iframe' },
    { name: 'List-GitHub-API', path: 'list-sidebar/api/github/index.html', type: 'list-api' },
    { name: 'List-Telegram-API', path: 'list-sidebar/api/telegram/index.html', type: 'list-api' },
    { name: 'List-VK-API', path: 'list-sidebar/api/vk/index.html', type: 'list-api' },
    { name: 'List-X-API', path: 'list-sidebar/api/x/index.html', type: 'list-api' },
    { name: 'List-GitHub-IFRAME', path: 'list-sidebar/iframe/github/index.html', type: 'list-iframe' },
    { name: 'List-Telegram-IFRAME', path: 'list-sidebar/iframe/telegram/index.html', type: 'list-iframe' },
    { name: 'List-VK-IFRAME', path: 'list-sidebar/iframe/vk/index.html', type: 'list-iframe' },
    { name: 'List-X-IFRAME', path: 'list-sidebar/iframe/x/index.html', type: 'list-iframe' }
  ];

  let totalIssues = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const fullPath = resolve(BASE_PATH, file.path);
    if (existsSync(fullPath)) {
      const { issueCount, warningCount } = checker.checkPage(fullPath, file.name, file.type);
      totalIssues += issueCount;
      totalWarnings += warningCount;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${colors.cyan}${colors.bold}Summary${colors.reset}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Pages checked: ${files.length}`);
  console.log(`${colors.red}Issues:        ${totalIssues}${colors.reset}`);
  console.log(`${colors.yellow}Warnings:      ${totalWarnings}${colors.reset}`);

  if (totalIssues === 0 && totalWarnings === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 All pages meet quality standards!${colors.reset}\n`);
  } else if (totalIssues === 0) {
    console.log(`\n${colors.green}${colors.bold}✓ No critical issues found!${colors.reset}`);
    console.log(`${colors.yellow}Some minor warnings to consider.${colors.reset}\n`);
  }

  console.log(`${'═'.repeat(60)}\n`);

  return totalIssues === 0;
}

runQualityChecks()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
