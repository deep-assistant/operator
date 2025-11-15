// Shared React UI Components for Operator demos
// This file contains reusable components for both list-sidebar and cards-stream modes

const { useState, useEffect } = React;

// Header Component
function OperatorHeader({ title, queueLength, showBackLink = true }) {
    return React.createElement('header', { className: 'header' },
        React.createElement('div', { className: 'header-left' },
            showBackLink && React.createElement('a', {
                href: '../../..',
                className: 'back-link',
                style: { marginRight: '1rem', color: 'var(--text-secondary)', textDecoration: 'none' }
            }, '← Back to Demos'),
            React.createElement('h1', null, title)
        ),
        React.createElement('div', { className: 'controls' },
            React.createElement('div', { className: 'queue-info' },
                React.createElement('span', { className: 'queue-count' },
                    'Queue: ',
                    React.createElement('span', null, queueLength)
                )
            )
        )
    );
}

// List Item Component for Sidebar
function ListItem({ item, isActive, onClick, renderPreview }) {
    return React.createElement('div', {
        className: `list-item ${isActive ? 'active' : ''}`,
        onClick: onClick
    },
        React.createElement('div', { className: 'list-item-header' },
            React.createElement('div', { className: 'list-item-source' }, item.source || item.type),
            React.createElement('div', { className: 'list-item-time' }, item.time || item.timeAgo)
        ),
        React.createElement('div', { className: 'list-item-title' }, item.title),
        renderPreview ? renderPreview(item) :
            React.createElement('div', { className: 'list-item-preview' },
                (item.content || item.body || '').substring(0, 60) + '...'
            )
    );
}

// Sidebar Component for List Mode
function Sidebar({ queue, currentIndex, onSelectCard }) {
    return React.createElement('aside', { className: 'sidebar active' },
        React.createElement('div', { className: 'sidebar-header' },
            React.createElement('h2', null, 'Queue')
        ),
        React.createElement('div', { className: 'card-list' },
            queue.map((item, index) =>
                React.createElement(ListItem, {
                    key: index,
                    item: item,
                    isActive: index === currentIndex,
                    onClick: () => onSelectCard(index)
                })
            )
        )
    );
}

// Card Component
function Card({ card, onDone, onNext, renderContent }) {
    return React.createElement('div', { className: 'card' },
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
                onClick: onDone
            },
                React.createElement('span', null, '✓'),
                ' DONE'
            ),
            React.createElement('button', {
                className: 'btn-secondary',
                onClick: onNext
            },
                React.createElement('span', null, '→'),
                ' NEXT'
            )
        )
    );
}

// Empty State Component
function EmptyState({ message, onAction, actionLabel }) {
    return React.createElement('div', { className: 'empty-state' },
        React.createElement('h2', null, message || 'No items in queue'),
        React.createElement('p', null, 'All tasks completed!'),
        onAction && React.createElement('button', {
            className: 'btn-secondary',
            onClick: onAction
        }, actionLabel || 'Reload')
    );
}

// Authentication Component
function AuthPrompt({ platform, onAuthenticate, customMessage }) {
    return React.createElement('div', { className: 'auth-prompt' },
        React.createElement('div', { className: 'auth-card' },
            React.createElement('h2', null, `${platform} Authentication`),
            React.createElement('p', null, customMessage || `Please authenticate with ${platform} to access your data.`),
            React.createElement('button', {
                className: 'btn-primary',
                onClick: onAuthenticate,
                style: { marginTop: '1rem', width: '100%' }
            }, `Connect ${platform}`)
        )
    );
}

// Loading Component
function LoadingSpinner({ message }) {
    return React.createElement('div', { className: 'loading-state' },
        React.createElement('div', { className: 'spinner' }),
        message && React.createElement('p', null, message)
    );
}

// List-Sidebar Mode App Component
function ListSidebarApp({
    title,
    fetchData,
    renderContent,
    renderPreview,
    platform
}) {
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (queue.length === 0) return;

            if (e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                handleDone();
            }

            if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }

            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                setCurrentIndex(currentIndex - 1);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [queue, currentIndex]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchData();
            setQueue(data);
            setAuthenticated(true);
        } catch (error) {
            console.error('Error loading data:', error);
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDone = () => {
        if (queue.length === 0) return;

        const newQueue = [...queue];
        newQueue.splice(currentIndex, 1);
        setQueue(newQueue);

        if (currentIndex >= newQueue.length && currentIndex > 0) {
            setCurrentIndex(newQueue.length - 1);
        }
    };

    const handleNext = () => {
        if (queue.length === 0) return;

        const newQueue = [...queue];
        const currentItem = newQueue.splice(currentIndex, 1)[0];
        newQueue.push(currentItem);
        setQueue(newQueue);

        if (currentIndex >= newQueue.length) {
            setCurrentIndex(0);
        }
    };

    const handleSelectCard = (index) => {
        setCurrentIndex(index);
    };

    const currentCard = queue[currentIndex];

    if (loading) {
        return React.createElement('div', { className: 'app' },
            React.createElement(LoadingSpinner, { message: 'Loading...' })
        );
    }

    if (!authenticated) {
        return React.createElement('div', { className: 'app' },
            React.createElement(AuthPrompt, {
                platform: platform,
                onAuthenticate: loadData
            })
        );
    }

    return React.createElement('div', { className: 'app' },
        React.createElement(OperatorHeader, {
            title: title,
            queueLength: queue.length
        }),
        React.createElement('div', { className: 'main-content' },
            React.createElement(Sidebar, {
                queue: queue,
                currentIndex: currentIndex,
                onSelectCard: handleSelectCard,
                renderPreview: renderPreview
            }),
            React.createElement('main', { className: 'card-container' },
                queue.length === 0 ?
                    React.createElement(EmptyState, {
                        onAction: loadData,
                        actionLabel: 'Reload Data'
                    }) :
                    React.createElement('div', { className: 'card-view' },
                        React.createElement(Card, {
                            card: currentCard,
                            onDone: handleDone,
                            onNext: handleNext,
                            renderContent: renderContent
                        })
                    )
            )
        )
    );
}

// Cards Stream (Focus) Mode App Component
function CardsStreamApp({
    title,
    fetchData,
    renderContent,
    platform
}) {
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (queue.length === 0) return;

            if (e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                handleDone();
            }

            if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [queue, currentIndex]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchData();
            setQueue(data);
            setAuthenticated(true);
        } catch (error) {
            console.error('Error loading data:', error);
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDone = () => {
        if (queue.length === 0) return;

        const newQueue = [...queue];
        newQueue.splice(currentIndex, 1);
        setQueue(newQueue);

        if (currentIndex >= newQueue.length && currentIndex > 0) {
            setCurrentIndex(newQueue.length - 1);
        }
    };

    const handleNext = () => {
        if (queue.length === 0) return;

        const newQueue = [...queue];
        const currentItem = newQueue.splice(currentIndex, 1)[0];
        newQueue.push(currentItem);
        setQueue(newQueue);

        if (currentIndex >= newQueue.length) {
            setCurrentIndex(0);
        }
    };

    const currentCard = queue[currentIndex];

    if (loading) {
        return React.createElement('div', { className: 'app' },
            React.createElement(LoadingSpinner, { message: 'Loading...' })
        );
    }

    if (!authenticated) {
        return React.createElement('div', { className: 'app' },
            React.createElement(AuthPrompt, {
                platform: platform,
                onAuthenticate: loadData
            })
        );
    }

    return React.createElement('div', { className: 'app' },
        React.createElement(OperatorHeader, {
            title: title,
            queueLength: queue.length
        }),
        React.createElement('div', { className: 'main-content' },
            React.createElement('main', { className: 'card-container focus-mode' },
                queue.length === 0 ?
                    React.createElement(EmptyState, {
                        onAction: loadData,
                        actionLabel: 'Reload Data'
                    }) :
                    React.createElement('div', { className: 'card-view' },
                        React.createElement(Card, {
                            card: currentCard,
                            onDone: handleDone,
                            onNext: handleNext,
                            renderContent: renderContent
                        })
                    )
            )
        )
    );
}
