# Operator Testing Scripts

Automated testing utilities for the Operator demo pages using Playwright.

## Setup

```bash
cd scripts
npm install
```

## Available Tests

### 1. Complete Test Suite
Run all tests across all demo pages:
```bash
npm test
```

This will:
- Test all 17 pages (1 landing + 16 demos)
- Check for HTTP errors
- Detect JavaScript errors
- Verify page content
- Capture screenshots
- Generate detailed report

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

## Troubleshooting

### Tests timeout
Increase timeout in test files if needed:
```javascript
timeout: 30000 // 30 seconds
```

### Screenshots not generated
Ensure the `screenshots/` directory is writable.

### Network errors
Check internet connection and verify the site is accessible:
```bash
curl -I https://deep-assistant.github.io/operator/
```
