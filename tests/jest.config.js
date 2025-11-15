/**
 * Jest Configuration for React Unit Tests
 */

export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/unit'],
  testMatch: ['**/*.test.js', '**/*.test.jsx'],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['@babel/preset-react'] }]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
  collectCoverageFrom: [
    '../shared/js/**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
