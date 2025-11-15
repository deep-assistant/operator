# Playwright MCP Testing Log

## Date: 2025-11-15

### Session Summary
Using Playwright MCP Navigate tool to debug all Operator demos on the live site.

## Critical Bug Found

### Bug #1: useState Redeclaration Error

**Severity:** Critical
**Affected Pages:** 8 API demo pages (all cards-stream/api/* and list-sidebar/api/*)

**Error Message:**
```
SyntaxError: Identifier 'useState' has already been declared
```

**Root Cause:**
- `shared/js/ui-components.js` declares: `const { useState, useEffect } = React;` (line 4)
- Each API demo HTML file also declared: `const { useState } = React;` in inline script
- This created a redeclaration conflict in the same scope

**Fix Applied:**
Removed duplicate `const { useState } = React;` declarations from all 8 affected HTML files:
- cards-stream/api/github/index.html
- cards-stream/api/telegram/index.html
- cards-stream/api/vk/index.html
- cards-stream/api/x/index.html
- list-sidebar/api/github/index.html
- list-sidebar/api/telegram/index.html
- list-sidebar/api/vk/index.html
- list-sidebar/api/x/index.html

**Status:** Fixed in commit da604ce

---

## Testing Checklist

### Landing Page (index.html)
- [x] Page loads successfully
- [x] All 16 demo cards are present
- [x] Navigation links work
- [x] No console errors (except favicon 404 - minor)

### Cards Stream - API Mode
- [ ] GitHub Issues/PRs - Pending deployment
- [ ] Telegram Messages - Not tested yet
- [ ] VK Messages - Not tested yet
- [ ] X (Twitter) DMs - Not tested yet

### Cards Stream - IFRAME Mode
- [ ] GitHub Issues/PRs - Not tested yet
- [ ] Telegram Messages - Not tested yet
- [ ] VK Messages - Not tested yet
- [ ] X (Twitter) DMs - Not tested yet

### List + Sidebar - API Mode
- [ ] GitHub Issues/PRs - Not tested yet
- [ ] Telegram Messages - Not tested yet
- [ ] VK Messages - Not tested yet
- [ ] X (Twitter) DMs - Not tested yet

### List + Sidebar - IFRAME Mode
- [ ] GitHub Issues/PRs - Not tested yet
- [ ] Telegram Messages - Not tested yet
- [ ] VK Messages - Not tested yet
- [ ] X (Twitter) DMs - Not tested yet

---

## Next Steps

1. Wait for GitHub Pages deployment to complete
2. Test all 16 demos with Playwright MCP
3. Create automated E2E test suite
4. Add React.js unit tests for shared components
5. Document findings and update PR
