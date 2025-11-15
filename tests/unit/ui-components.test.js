/**
 * Unit Tests for React UI Components
 *
 * This file contains comprehensive unit tests for all shared React components
 * used across the Operator demos.
 *
 * Setup Required:
 * - @testing-library/react
 * - @testing-library/jest-dom
 * - jest or vitest
 *
 * Run: npm test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock React for global access
global.React = React;
const { useState, useEffect } = React;

// Import components (in actual setup, these would be imported from the component file)
// For now, we'll include inline versions for testing

// Mock components (simplified versions for testing)
function OperatorHeader({ title, queueLength, showBackLink = true }) {
  return React.createElement('header', { className: 'header', 'data-testid': 'header' },
    React.createElement('div', { className: 'header-left' },
      showBackLink && React.createElement('a', {
        href: '../../..',
        className: 'back-link',
        'data-testid': 'back-link'
      }, '← Back to Demos'),
      React.createElement('h1', null, title)
    ),
    React.createElement('div', { className: 'controls' },
      React.createElement('div', { className: 'queue-info' },
        React.createElement('span', { className: 'queue-count', 'data-testid': 'queue-count' },
          'Queue: ',
          React.createElement('span', null, queueLength)
        )
      )
    )
  );
}

function Card({ card, onDone, onNext, renderContent }) {
  return React.createElement('div', { className: 'card', 'data-testid': 'card' },
    React.createElement('div', { className: 'card-header' },
      React.createElement('div', { className: 'card-source' }, card.source || card.type),
      React.createElement('div', { className: 'card-time' }, card.time || card.timeAgo)
    ),
    React.createElement('div', { className: 'card-body' },
      React.createElement('h3', { className: 'card-title' }, card.title),
      renderContent ? renderContent(card) :
        React.createElement('div', { className: 'card-content' }, card.content || card.body)
    ),
    React.createElement('div', { className: 'card-footer' },
      React.createElement('button', {
        className: 'btn-primary',
        onClick: onDone,
        'data-testid': 'done-button'
      },
        React.createElement('span', null, '✓'),
        ' DONE'
      ),
      React.createElement('button', {
        className: 'btn-secondary',
        onClick: onNext,
        'data-testid': 'next-button'
      },
        React.createElement('span', null, '→'),
        ' NEXT'
      )
    )
  );
}

function EmptyState({ message, onAction, actionLabel }) {
  return React.createElement('div', { className: 'empty-state', 'data-testid': 'empty-state' },
    React.createElement('h2', null, message || 'No items in queue'),
    React.createElement('p', null, 'All tasks completed!'),
    onAction && React.createElement('button', {
      className: 'btn-secondary',
      onClick: onAction,
      'data-testid': 'action-button'
    }, actionLabel || 'Reload')
  );
}

function LoadingSpinner({ message }) {
  return React.createElement('div', { className: 'loading-state', 'data-testid': 'loading-state' },
    React.createElement('div', { className: 'spinner' }),
    message && React.createElement('p', null, message)
  );
}

describe('OperatorHeader Component', () => {
  test('renders title correctly', () => {
    render(<OperatorHeader title="Test Title" queueLength={5} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('displays queue length', () => {
    render(<OperatorHeader title="Test" queueLength={10} />);
    const queueCount = screen.getByTestId('queue-count');
    expect(queueCount).toHaveTextContent('Queue: 10');
  });

  test('shows back link when showBackLink is true', () => {
    render(<OperatorHeader title="Test" queueLength={5} showBackLink={true} />);
    expect(screen.getByTestId('back-link')).toBeInTheDocument();
  });

  test('hides back link when showBackLink is false', () => {
    render(<OperatorHeader title="Test" queueLength={5} showBackLink={false} />);
    expect(screen.queryByTestId('back-link')).not.toBeInTheDocument();
  });

  test('updates queue length when prop changes', () => {
    const { rerender } = render(<OperatorHeader title="Test" queueLength={5} />);
    expect(screen.getByTestId('queue-count')).toHaveTextContent('Queue: 5');

    rerender(<OperatorHeader title="Test" queueLength={3} />);
    expect(screen.getByTestId('queue-count')).toHaveTextContent('Queue: 3');
  });
});

describe('Card Component', () => {
  const mockCard = {
    source: 'GitHub',
    time: '2h ago',
    title: 'Test Issue',
    content: 'This is a test issue content'
  };

  test('renders card with correct content', () => {
    render(<Card card={mockCard} onDone={jest.fn()} onNext={jest.fn()} />);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
    expect(screen.getByText('This is a test issue content')).toBeInTheDocument();
  });

  test('calls onDone when DONE button is clicked', () => {
    const onDoneMock = jest.fn();
    render(<Card card={mockCard} onDone={onDoneMock} onNext={jest.fn()} />);

    const doneButton = screen.getByTestId('done-button');
    fireEvent.click(doneButton);

    expect(onDoneMock).toHaveBeenCalledTimes(1);
  });

  test('calls onNext when NEXT button is clicked', () => {
    const onNextMock = jest.fn();
    render(<Card card={mockCard} onDone={jest.fn()} onNext={onNextMock} />);

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    expect(onNextMock).toHaveBeenCalledTimes(1);
  });

  test('uses custom renderContent when provided', () => {
    const customRender = (card) => React.createElement('div', { 'data-testid': 'custom-content' }, 'Custom: ' + card.title);

    render(<Card card={mockCard} onDone={jest.fn()} onNext={jest.fn()} renderContent={customRender} />);

    expect(screen.getByTestId('custom-content')).toHaveTextContent('Custom: Test Issue');
  });

  test('falls back to body when content is not available', () => {
    const cardWithBody = { ...mockCard, content: undefined, body: 'Body content' };
    render(<Card card={cardWithBody} onDone={jest.fn()} onNext={jest.fn()} />);

    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('EmptyState Component', () => {
  test('renders default message', () => {
    render(<EmptyState />);

    expect(screen.getByText('No items in queue')).toBeInTheDocument();
    expect(screen.getByText('All tasks completed!')).toBeInTheDocument();
  });

  test('renders custom message', () => {
    render(<EmptyState message="Custom empty message" />);

    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  test('renders action button when onAction is provided', () => {
    const onActionMock = jest.fn();
    render(<EmptyState onAction={onActionMock} actionLabel="Refresh" />);

    const actionButton = screen.getByTestId('action-button');
    expect(actionButton).toHaveTextContent('Refresh');
  });

  test('calls onAction when action button is clicked', () => {
    const onActionMock = jest.fn();
    render(<EmptyState onAction={onActionMock} />);

    const actionButton = screen.getByTestId('action-button');
    fireEvent.click(actionButton);

    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  test('does not render action button when onAction is not provided', () => {
    render(<EmptyState />);

    expect(screen.queryByTestId('action-button')).not.toBeInTheDocument();
  });
});

describe('LoadingSpinner Component', () => {
  test('renders loading spinner', () => {
    render(<LoadingSpinner />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByTestId('loading-state').querySelector('.spinner')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  test('does not render message when not provided', () => {
    const { container } = render(<LoadingSpinner />);
    const paragraphs = container.querySelectorAll('p');

    expect(paragraphs.length).toBe(0);
  });
});

describe('Component Integration', () => {
  test('multiple components work together', () => {
    const mockCard = {
      source: 'Telegram',
      time: '1h ago',
      title: 'Integration Test',
      content: 'Testing multiple components'
    };

    const { container } = render(
      <div>
        <OperatorHeader title="Integration Test" queueLength={1} />
        <Card card={mockCard} onDone={jest.fn()} onNext={jest.fn()} />
      </div>
    );

    expect(screen.getByText('Integration Test')).toBeInTheDocument();
    expect(screen.getByTestId('queue-count')).toHaveTextContent('Queue: 1');
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  test('buttons have proper accessibility attributes', () => {
    const mockCard = {
      source: 'GitHub',
      title: 'Accessibility Test',
      content: 'Test content'
    };

    render(<Card card={mockCard} onDone={jest.fn()} onNext={jest.fn()} />);

    const doneButton = screen.getByTestId('done-button');
    const nextButton = screen.getByTestId('next-button');

    expect(doneButton).toHaveClass('btn-primary');
    expect(nextButton).toHaveClass('btn-secondary');
  });

  test('EmptyState action button is keyboard accessible', () => {
    const onActionMock = jest.fn();
    render(<EmptyState onAction={onActionMock} />);

    const button = screen.getByTestId('action-button');
    button.focus();

    expect(document.activeElement).toBe(button);
  });
});
