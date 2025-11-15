# Testing Examples and Usage

## Quick Reference

### What Works in Claude Code Sandbox ✅

```bash
# Navigate to scripts directory
cd /home/user/operator/scripts

# Install dependencies (already done)
npm install

# Run HTML validation (WORKS)
npm run validate
# Output: 17/17 HTML files validated successfully

# Run code quality checks (WORKS)
npm run quality
# Output: 0 critical issues, 49 minor warnings

# Test live site without browser (WORKS)
node test-with-curl.js
# Output: 17/17 pages accessible and valid
```

### Example Output: HTML Validation

```
╔══════════════════════════════════════════════════════════╗
║ HTML Validation - Static Analysis                       ║
╚══════════════════════════════════════════════════════════╝

Validating HTML Files
────────────────────────────────────────────────────────────
✓ Landing Page
  Title: "Operator - Demo Selection"
  Size: 14.91 KB
✓ Cards-GitHub-API
  Title: "GitHub Issues/PRs - Focus Mode - API"
  Size: 3.86 KB
...

════════════════════════════════════════════════════════════
Validation Summary
════════════════════════════════════════════════════════════
Total:  17
Passed: 17
Failed: 0
════════════════════════════════════════════════════════════
```

### Example Output: Live Site Testing

```
════════════════════════════════════════════════════════════
Testing Live Demo Pages via curl
════════════════════════════════════════════════════════════

Testing: Landing Page
URL: https://deep-assistant.github.io/operator/
✓ Downloaded: 14.91 KB
✓ Title: "Operator - Demo Selection"
✓ Has DOCTYPE: true
✓ Has Body: true
✓ Demo cards: 16
✓ Demo links: 16

Testing: Cards-GitHub-API
URL: https://deep-assistant.github.io/operator/cards-stream/api/github/
✓ Downloaded: 3.86 KB
✓ Title: "GitHub Issues/PRs - Focus Mode - API"
✓ Has React: true
✓ Has CSS: true
✓ Has JS Components: true

...

════════════════════════════════════════════════════════════
Test Summary
════════════════════════════════════════════════════════════
Total:  17
Passed: 17
Failed: 0

════════════════════════════════════════════════════════════
✓ ALL 17 PAGES TESTED SUCCESSFULLY!
✓ All pages are live and accessible
✓ All pages have correct structure
✓ All dependencies loaded
════════════════════════════════════════════════════════════
```

## Configuration Examples

### package.json Scripts

```json
{
  "scripts": {
    "test": "node test-all-demos.js",
    "test:visual": "node test-visual.js",
    "test:landing": "node test-landing.js",
    "test:screenshots": "node test-screenshots.js",
    "validate": "node validate-html.js",
    "quality": "node check-quality.js",
    "verify": "node verify-setup.js",
    "test:local": "node test-local.js",
    "check:all": "npm run validate && npm run quality"
  }
}
```

### Playwright Configuration (for normal environments)

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './scripts',
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});
```

### GitHub Actions CI/CD Example

```yaml
# .github/workflows/test.yml
name: Test Demo Pages

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd scripts
          npm install
          npx playwright install chromium

      - name: Run validation tests
        run: |
          cd scripts
          npm run validate
          npm run quality

      - name: Run browser tests
        run: |
          cd scripts
          npm test

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: scripts/screenshots/
```

## Testing Different Scenarios

### Test Specific Page Type

```bash
# Test only cards-stream pages
find ../cards-stream -name "index.html" -exec echo "Testing {}" \;

# Test only list-sidebar pages
find ../list-sidebar -name "index.html" -exec echo "Testing {}" \;

# Test only API integration pages
find .. -path "*/api/*/index.html" -exec echo "Testing {}" \;

# Test only IFRAME pages
find .. -path "*/iframe/*/index.html" -exec echo "Testing {}" \;
```

### Manual Browser Testing

```bash
# Start local server
cd /home/user/operator
python3 -m http.server 8080

# Open in browser (outside Claude Code):
# http://localhost:8080/
# http://localhost:8080/cards-stream/api/github/
# http://localhost:8080/list-sidebar/api/telegram/
```

### Verify Live Deployment

```bash
# Check landing page
curl -I https://deep-assistant.github.io/operator/

# Check specific demo
curl -I https://deep-assistant.github.io/operator/cards-stream/api/github/

# Download and validate
curl -s https://deep-assistant.github.io/operator/ | grep -c "demo-card"
# Should output: 16
```

## Test Data Used

### Mock GitHub Data
```javascript
// From shared/js/auth-utils.js
const issues = MockDataGenerators.github.generateIssues(5);
const prs = MockDataGenerators.github.generatePullRequests(3);

// Issues have labels: ['bug', 'enhancement']
// PRs now correctly include pull_request property (bug fixed!)
```

### Expected Page Counts
- **Total pages:** 17
- **Landing page:** 1
- **Cards Stream:** 8 (4 API + 4 IFRAME)
- **List + Sidebar:** 8 (4 API + 4 IFRAME)
- **Platforms per mode:** 4 (GitHub, Telegram, VK, X)

## Known Issues & Fixes

### Fixed Issues ✅

1. **Pull Requests Labeled as Issues** (FIXED in commit c8afc83)
   - **File:** `shared/js/auth-utils.js:189`
   - **Fix:** Added `pull_request: { url: ... }` property
   - **Impact:** GitHub demo pages now correctly distinguish PRs from Issues

### Minor Warnings ⚠️

1. **Missing Meta Descriptions** (49 warnings, non-critical)
   - All demo pages missing `<meta name="description">` tags
   - Impact: Low (these are demo pages, not production content)
   - Recommendation: Add if SEO important for demo showcase

## Performance Benchmarks

### File Sizes
- Landing page: 14.91 KB
- Cards Stream API pages: ~3.3-3.9 KB each
- Cards Stream IFRAME pages: ~5.2-6.3 KB each
- List Sidebar API pages: ~3.6-4.4 KB each
- List Sidebar IFRAME pages: ~4.5-5.3 KB each

### Load Times (via curl)
- All pages: < 1 second to download HTML
- Total test suite: ~30-40 seconds for all 17 pages

## Best Practices

### For Development
1. Always run `npm run validate` after HTML changes
2. Run `npm run quality` to check for issues
3. Test locally with `python3 -m http.server` before committing
4. Use `git status` to ensure no untracked files

### For Deployment
1. Test with `node test-with-curl.js` before pushing
2. Verify all 17 pages return HTTP 200
3. Check GitHub Pages deployment status
4. Manually test key user flows in browser

### For CI/CD
1. Run validation and quality checks on every commit
2. Run full browser tests on PRs
3. Generate screenshots for visual regression
4. Archive test results as artifacts
