# Operator Testing Scripts

Comprehensive testing utilities for the Operator demo pages with multiple testing approaches.

## Quick Start

```bash
cd scripts
npm install

# Run the working tests (no browser required)
npm run validate      # HTML validation
npm run quality       # Code quality checks

# For full browser testing, see "Browser Testing Limitations" below
```

## ⚠️ Important: Browser Testing Limitations

**Browser automation (Playwright/Puppeteer) does NOT work in Claude Code sandbox** due to Chromium crashes. See `BROWSER_TESTING_LIMITATIONS.md` for details.

**What works:**
- ✅ Static HTML validation
- ✅ Code quality checks
- ✅ curl-based live site testing
- ✅ Manual code review

**What doesn't work in this environment:**
- ❌ Playwright browser automation
- ❌ Puppeteer browser automation
- ❌ Visual rendering tests
- ❌ Screenshot generation

## Available Tests

### Tests That Work ✅

#### 1. HTML Validation
Validates all 17 HTML files for structure and syntax:
```bash
npm run validate
```

Results: **17/17 passed**

#### 2. Code Quality Checks
Checks accessibility, SEO, responsive design, and performance:
```bash
npm run quality
```

Results: **0 critical issues, 49 minor warnings**

#### 3. Live Site Testing (curl-based)
Tests all 17 pages on the live site without browser:
```bash
node test-with-curl.js
```

This verifies:
- ✅ All pages return HTTP 200 OK
- ✅ All page titles correct
- ✅ All HTML structure valid
- ✅ React dependencies referenced
- ✅ CSS stylesheets referenced
- ✅ Landing page has 16 demo cards

Results: **17/17 passed**

### Tests That Require Normal Environment ❌

The following tests require Playwright/Puppeteer and **will not work in Claude Code sandbox**:

#### 1. Complete Test Suite
```bash
npm test  # Requires browser - will fail in sandbox
```

#### 2. Visual Testing
```bash
npm run test:visual  # Requires browser - will fail in sandbox
```

#### 3. Screenshot Generation
```bash
npm run test:screenshots  # Requires browser - will fail in sandbox
```

#### 4. Landing Page Browser Tests
```bash
npm run test:landing  # Requires browser - will fail in sandbox
```

**To run these:** Clone the repo locally or use standard CI/CD

### 2. Visual Testing
Capture screenshots across multiple viewports:
```bash
npm run test:visual
```

Captures screenshots for:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

### 3. Landing Page Test
Focused testing of the landing page:
```bash
npm run test:landing
```

Tests:
- Page load and title
- Header content
- Integration type legend
- All 16 demo card links
- Section structure
- Responsive design
- Hover interactions

### 4. Screenshot Capture
Generate screenshots of all pages:
```bash
npm run test:screenshots
```

Creates:
- Full-page screenshots of all 17 pages
- HTML index for easy viewing
- Organized screenshot gallery

## Test Output

All tests generate:
- **Console output**: Real-time test results with color coding
- **Screenshots**: Saved to `screenshots/` directory
- **Exit codes**: 0 for success, 1 for failures

## Test Coverage

The test suite covers:

### Landing Page
- ✓ Page load and rendering
- ✓ Header and subtitle
- ✓ Integration types legend
- ✓ 16 demo card links
- ✓ Section titles and organization
- ✓ Responsive design (mobile/tablet/desktop)

### Demo Pages (16 total)
**Cards Stream Mode:**
- ✓ API: GitHub, Telegram, VK, X
- ✓ IFRAME: GitHub, Telegram, VK, X

**List + Sidebar Mode:**
- ✓ API: GitHub, Telegram, VK, X
- ✓ IFRAME: GitHub, Telegram, VK, X

### Checks Performed
- ✓ HTTP response status
- ✓ JavaScript errors
- ✓ Console errors
- ✓ Page structure (body, content)
- ✓ CSS stylesheets
- ✓ Page title
- ✓ Visual rendering

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```bash
# Run tests in CI
cd scripts
npm install
npm test

# Exit code 0 = all tests passed
# Exit code 1 = one or more tests failed
```

## Viewing Results

After running tests:
1. Check console output for detailed results
2. View screenshots in `screenshots/` directory
3. Open `screenshots/index.html` for visual gallery

## Requirements

- Node.js 14+
- Playwright (automatically installed)
- Internet connection (to access GitHub Pages)

## Running Tests in Normal Environment

To run full browser tests outside of Claude Code:

```bash
# Clone the repository
git clone https://github.com/deep-assistant/operator.git
cd operator/scripts

# Install dependencies
npm install
npx playwright install chromium

# Run browser tests (will work now)
npm test
npm run test:visual
npm run test:screenshots

# Or test manually in browser
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

## Troubleshooting

### In Claude Code Sandbox

**Problem:** Playwright/Puppeteer tests fail with "Page crashed" or "ERR_TUNNEL_CONNECTION_FAILED"

**Solution:** This is expected. Use the curl-based tests instead:
```bash
node test-with-curl.js
npm run validate
npm run quality
```

### In Normal Environment

**Tests timeout:**
Increase timeout in test files if needed:
```javascript
timeout: 30000 // 30 seconds
```

**Screenshots not generated:**
Ensure the `screenshots/` directory is writable.

**Network errors:**
Check internet connection and verify the site is accessible:
```bash
curl -I https://deep-assistant.github.io/operator/
```
