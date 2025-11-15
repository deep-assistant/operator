/**
 * Jest setup file for React Testing Library
 */

import '@testing-library/jest-dom';

// Mock global React for components that expect it
global.React = require('react');
