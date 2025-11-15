# Operator Test Suite

Comprehensive automated testing for the Operator demo pages.

## Overview

This test suite provides:

1. **E2E Tests** - End-to-end tests using Playwright for all 17 pages
2. **Unit Tests** - React component unit tests using Jest and React Testing Library
3. **CI/CD Integration** - Ready for GitHub Actions and other CI systems

## Quick Start

```bash
cd tests
npm install

# Run all tests
npm test

# Run only E2E tests
npm run test:e2e

# Run only unit tests
npm run test:unit

# Run tests in watch mode (for development)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── e2e-playwright.test.js       # E2E tests for all demo pages
├── unit/
│   └── ui-components.test.js    # Unit tests for React components
├── package.json                 # Test dependencies
├── jest.config.js               # Jest configuration
├── setup-tests.js               # Jest setup for React Testing Library
└── README.md                    # This file
```

## E2E Tests

### What's Tested

- **Landing Page**: All 16 demo cards, navigation, layout
- **All Demo Pages**: Each of the 16 demos (8 cards-stream + 8 list-sidebar)
- **Interactive Features**: DONE/NEXT buttons, keyboard shortcuts, sidebar navigation
- **Error Detection**: JavaScript errors, console errors, rendering failures
- **React Rendering**: Component mounting, state management, loading states

### Configuration

The E2E tests target: `https://deep-assistant.github.io/operator/`

To test locally, update `BASE_URL` in `e2e-playwright.test.js`:

```javascript
const BASE_URL = 'http://localhost:8080/';
```

### Running E2E Tests

```bash
# Headless mode (default)
npm run test:e2e

# Headed mode (see the browser)
npm run test:e2e:headed
```

## Unit Tests

### What's Tested

React components from `shared/js/ui-components.js`:

- **OperatorHeader**: Title, queue count, back link
- **Card**: Content rendering, button interactions, custom renderers
- **EmptyState**: Messages, action buttons
- **LoadingSpinner**: Loading states, custom messages
- **Integration Tests**: Multiple components working together
- **Accessibility**: Keyboard navigation, focus management

### Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Coverage Thresholds

The test suite enforces minimum coverage:

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

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
          cd tests
          npm install
          npx playwright install chromium
      - name: Run tests
        run: |
          cd tests
          npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
```

## Test Results

### Expected Output

E2E tests check:
- ✓ Landing page loads with 16 demo cards
- ✓ All 16 demos render without errors
- ✓ Interactive features work correctly
- ✓ No critical JavaScript errors

Unit tests verify:
- ✓ Components render correctly
- ✓ Props are handled properly
- ✓ User interactions trigger correct callbacks
- ✓ Edge cases are handled

### Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

## Troubleshooting

### E2E Tests Fail with "Page crashed"

This can happen in sandboxed environments. The tests include retry logic and proper error handling.

### Unit Tests Can't Find Modules

Ensure all dependencies are installed:

```bash
cd tests
npm install
```

### Coverage is Below Threshold

Add more test cases for uncovered components or adjust thresholds in `jest.config.js`.

## Adding New Tests

### Adding E2E Tests

Edit `e2e-playwright.test.js` and add new test functions:

```javascript
async function testNewFeature(page, results) {
  // Your test code
}

// Call it in runTests()
await testNewFeature(page, results);
```

### Adding Unit Tests

Create new test files in `unit/` directory:

```javascript
// unit/new-component.test.js
import { render, screen } from '@testing-library/react';
import MyComponent from '../path/to/component';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Keep tests isolated** - Each test should be independent
2. **Use descriptive names** - Test names should describe what they're testing
3. **Test user behavior** - Focus on how users interact with components
4. **Mock external dependencies** - Isolate components from external services
5. **Maintain coverage** - Add tests for new features before merging

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
