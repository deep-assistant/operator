#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
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
  magenta: '\x1b[35m'
};

class HTMLValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
    this.failed = 0;
  }

  validateFile(filePath, name) {
    try {
      const content = readFileSync(filePath, 'utf-8');

      const checks = [
        this.checkDoctype(content),
        this.checkHtmlTag(content),
        this.checkHead(content),
        this.checkTitle(content),
        this.checkBody(content),
        this.checkScripts(content),
        this.checkLinks(content),
        this.checkMeta(content)
      ];

      const allPassed = checks.every(c => c.passed);

      const title = this.extractTitle(content);
      const hasContent = content.trim().length > 1000;

      if (allPassed && hasContent) {
        this.passed++;
        console.log(`${colors.green}✓${colors.reset} ${name}`);
        console.log(`  Title: "${title}"`);
        console.log(`  Size: ${(content.length / 1024).toFixed(2)} KB`);
      } else {
        this.failed++;
        console.log(`${colors.red}✗${colors.reset} ${name}`);
        checks.forEach(check => {
          if (!check.passed) {
            console.log(`  ${colors.red}✗${colors.reset} ${check.message}`);
          }
        });
      }

      return { passed: allPassed && hasContent, checks, title };
    } catch (error) {
      this.failed++;
      console.log(`${colors.red}✗${colors.reset} ${name}: ${error.message}`);
      return { passed: false, error: error.message };
    }
  }

  checkDoctype(content) {
    const hasDoctype = /<!DOCTYPE\s+html>/i.test(content);
    return {
      passed: hasDoctype,
      message: hasDoctype ? 'Has DOCTYPE' : 'Missing DOCTYPE'
    };
  }

  checkHtmlTag(content) {
    const hasHtml = /<html/i.test(content) && /<\/html>/i.test(content);
    return {
      passed: hasHtml,
      message: hasHtml ? 'Has <html> tags' : 'Missing <html> tags'
    };
  }

  checkHead(content) {
    const hasHead = /<head/i.test(content) && /<\/head>/i.test(content);
    return {
      passed: hasHead,
      message: hasHead ? 'Has <head> section' : 'Missing <head> section'
    };
  }

  checkTitle(content) {
    const hasTitle = /<title>[\s\S]*?<\/title>/i.test(content);
    return {
      passed: hasTitle,
      message: hasTitle ? 'Has <title>' : 'Missing <title>'
    };
  }

  checkBody(content) {
    const hasBody = /<body/i.test(content) && /<\/body>/i.test(content);
    return {
      passed: hasBody,
      message: hasBody ? 'Has <body> tags' : 'Missing <body> tags'
    };
  }

  checkScripts(content) {
    const hasScripts = /<script[\s\S]*?<\/script>/i.test(content);
    const count = (content.match(/<script/gi) || []).length;
    return {
      passed: true,
      message: `Scripts: ${count}`
    };
  }

  checkLinks(content) {
    const hasLinks = /<a\s+[^>]*href/i.test(content);
    const count = (content.match(/<a\s+[^>]*href/gi) || []).length;
    return {
      passed: true,
      message: `Links: ${count}`
    };
  }

  checkMeta(content) {
    const hasViewport = /name="viewport"/i.test(content);
    const hasCharset = /charset/i.test(content);
    return {
      passed: hasViewport && hasCharset,
      message: hasViewport && hasCharset ? 'Has meta tags' : 'Missing meta tags'
    };
  }

  extractTitle(content) {
    const match = content.match(/<title>([\s\S]*?)<\/title>/i);
    return match ? match[1].trim() : 'No title';
  }

  summary() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${colors.cyan}Validation Summary${colors.reset}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Total:  ${this.passed + this.failed}`);
    console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);
    console.log(`${'═'.repeat(60)}\n`);
  }
}

async function validateAllPages() {
  console.log(`${colors.magenta}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.magenta}║${colors.reset} HTML Validation - Static Analysis                         ${colors.magenta}║${colors.reset}`);
  console.log(`${colors.magenta}╚${'═'.repeat(58)}╝${colors.reset}\n`);

  const validator = new HTMLValidator();

  const files = [
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

  console.log(`${colors.yellow}Validating HTML Files${colors.reset}`);
  console.log('─'.repeat(60));

  for (const file of files) {
    const fullPath = resolve(BASE_PATH, file.path);
    if (existsSync(fullPath)) {
      validator.validateFile(fullPath, file.name);
    } else {
      validator.failed++;
      console.log(`${colors.red}✗${colors.reset} ${file.name}: File not found`);
    }
  }

  validator.summary();

  return validator.failed === 0;
}

validateAllPages()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
