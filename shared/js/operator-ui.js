// Operator - Queue-based Decision Making UI with React
const { useState, useEffect } = React;

// Sample data generator
const getSampleData = () => [
    {
        source: 'Telegram',
        time: '2 min ago',
        title: 'Product Launch Discussion',
        content: 'Hey! I wanted to discuss the timeline for the new product launch. We have three potential dates, and I need your input on which one works best for the marketing campaign. Also, should we coordinate with the sales team first?'
    },
    {
        source: 'Claude Code',
        time: '5 min ago',
        title: 'API Implementation Review',
        content: 'The REST API implementation is complete. I\'ve added authentication, rate limiting, and comprehensive error handling. The code is ready for your review. Should I proceed with deployment to staging?'
    },
    {
        source: 'X (Twitter)',
        time: '10 min ago',
        title: 'Partnership Opportunity',
        content: 'We\'re looking to partner with innovative companies in the AI space. Your recent work caught our attention. Would you be interested in a quick call this week to explore potential collaboration?'
    },
    {
        source: 'VK',
        time: '15 min ago',
        title: 'Team Meeting Reschedule',
        content: 'The Thursday team meeting needs to be rescheduled due to a conflict. Can we move it to Friday at 2 PM? Please confirm if this works for your schedule.'
    },
    {
        source: 'Telegram',
        time: '20 min ago',
        title: 'Bug Report - Critical',
        content: 'Users are reporting issues with the login functionality. The error happens intermittently when using OAuth. This needs immediate attention. Should I create a hotfix branch?'
    },
    {
        source: 'AI Assistant',
        time: '25 min ago',
        title: 'Code Optimization Suggestions',
        content: 'I\'ve analyzed the codebase and found several optimization opportunities that could improve performance by 30-40%. Would you like me to implement these changes or would you prefer to review them first?'
    },
    {
        source: 'Telegram',
        time: '30 min ago',
        title: 'Client Feedback',
        content: 'The client loved the prototype! They have a few minor adjustments they\'d like to see. The main request is to add dark mode support. Should I prioritize this for the next sprint?'
    },
    {
        source: 'X (Twitter)',
        time: '35 min ago',
        title: 'Conference Speaking Invitation',
        content: 'We\'d love to have you speak at TechConf 2024 about your work in AI-assisted development. The event is in San Francisco next month. Are you interested?'
    }
];

// Header Component
function Header({ viewMode, setViewMode, queueLength }) {
    return (
        <header className="header">
            <h1>Operator</h1>
            <div className="controls">
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'focus' ? 'active' : ''}`}
                        onClick={() => setViewMode('focus')}
                    >
                        Focus Mode
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        List Mode
                    </button>
                </div>
                <div className="queue-info">
                    <span className="queue-count">Queue: <span>{queueLength}</span></span>
                </div>
            </div>
        </header>
    );
}

// List Item Component
function ListItem({ item, isActive, onClick }) {
    return (
        <div
            className={`list-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="list-item-header">
                <div className="list-item-source">{item.source}</div>
                <div className="list-item-time">{item.time}</div>
            </div>
            <div className="list-item-title">{item.title}</div>
            <div className="list-item-preview">
                {item.content.substring(0, 60)}...
            </div>
        </div>
    );
}

// Sidebar Component
function Sidebar({ queue, currentIndex, onSelectCard, isVisible }) {
    if (!isVisible) return null;

    return (
        <aside className={`sidebar ${isVisible ? 'active' : ''}`}>
            <div className="sidebar-header">
                <h2>Queue</h2>
            </div>
            <div className="card-list">
                {queue.map((item, index) => (
                    <ListItem
                        key={index}
                        item={item}
                        isActive={index === currentIndex}
                        onClick={() => onSelectCard(index)}
                    />
                ))}
            </div>
        </aside>
    );
}

// Card Component
function Card({ card, onDone, onNext }) {
    return (
        <div className="card">
            <div className="card-header">
                <div className="card-source">{card.source}</div>
                <div className="card-time">{card.time}</div>
            </div>
            <div className="card-body">
                <h3 className="card-title">{card.title}</h3>
                <div className="card-content">{card.content}</div>
            </div>
            <div className="card-footer">
                <button className="btn-primary" onClick={onDone}>
                    <span>✓</span> DONE
                </button>
                <button className="btn-secondary" onClick={onNext}>
                    <span>→</span> NEXT
                </button>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ onAddSample }) {
    return (
        <div className="empty-state">
            <h2>No items in queue</h2>
            <p>All tasks completed!</p>
            <button className="btn-secondary" onClick={onAddSample}>
                Add Sample Items
            </button>
        </div>
    );
}

// Main App Component
function App() {
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState('focus');

    // Load sample data on mount
    useEffect(() => {
        setQueue(getSampleData());
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (queue.length === 0) return;

            // D key for Done
            if (e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                handleDone();
            }

            // N key or Right Arrow for Next
            if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }

            // Left Arrow to go back (in list mode)
            if (e.key === 'ArrowLeft' && viewMode === 'list' && currentIndex > 0) {
                e.preventDefault();
                setCurrentIndex(currentIndex - 1);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [queue, currentIndex, viewMode]);

    const handleDone = () => {
        if (queue.length === 0) return;

        const newQueue = [...queue];
        newQueue.splice(currentIndex, 1);
        setQueue(newQueue);

        // Adjust index if necessary
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

        // Stay at same index (which now shows the next item)
        if (currentIndex >= newQueue.length) {
            setCurrentIndex(0);
        }
    };

    const handleSelectCard = (index) => {
        setCurrentIndex(index);
    };

    const handleAddSample = () => {
        setQueue(getSampleData());
        setCurrentIndex(0);
    };

    const currentCard = queue[currentIndex];

    return (
        <div className="app">
            <Header
                viewMode={viewMode}
                setViewMode={setViewMode}
                queueLength={queue.length}
            />
            <div className="main-content">
                <Sidebar
                    queue={queue}
                    currentIndex={currentIndex}
                    onSelectCard={handleSelectCard}
                    isVisible={viewMode === 'list'}
                />
                <main className={`card-container ${viewMode === 'focus' ? 'focus-mode' : ''}`}>
                    {queue.length === 0 ? (
                        <EmptyState onAddSample={handleAddSample} />
                    ) : (
                        <div className="card-view">
                            <Card
                                card={currentCard}
                                onDone={handleDone}
                                onNext={handleNext}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
