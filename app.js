// Operator - Queue-based Decision Making UI
class OperatorApp {
    constructor() {
        this.queue = [];
        this.currentIndex = 0;
        this.viewMode = 'focus'; // 'focus' or 'list'

        this.initializeElements();
        this.attachEventListeners();
        this.loadSampleData();
        this.updateUI();
    }

    initializeElements() {
        // Mode toggles
        this.focusModeBtn = document.getElementById('focusMode');
        this.listModeBtn = document.getElementById('listMode');

        // Containers
        this.sidebar = document.getElementById('sidebar');
        this.cardContainer = document.getElementById('cardContainer');
        this.cardList = document.getElementById('cardList');
        this.emptyState = document.getElementById('emptyState');
        this.cardView = document.getElementById('cardView');

        // Card elements
        this.cardSource = document.getElementById('cardSource');
        this.cardTime = document.getElementById('cardTime');
        this.cardTitle = document.getElementById('cardTitle');
        this.cardContent = document.getElementById('cardContent');

        // Buttons
        this.doneBtn = document.getElementById('doneBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.addSampleBtn = document.getElementById('addSampleBtn');

        // Queue info
        this.queueCount = document.getElementById('queueCount');
    }

    attachEventListeners() {
        // Mode switching
        this.focusModeBtn.addEventListener('click', () => this.switchMode('focus'));
        this.listModeBtn.addEventListener('click', () => this.switchMode('list'));

        // Actions
        this.doneBtn.addEventListener('click', () => this.handleDone());
        this.nextBtn.addEventListener('click', () => this.handleNext());
        this.addSampleBtn.addEventListener('click', () => {
            this.loadSampleData();
            this.updateUI();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.queue.length === 0) return;

            // D key for Done
            if (e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                this.handleDone();
            }

            // N key or Right Arrow for Next
            if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.handleNext();
            }

            // Left Arrow to go back (in list mode)
            if (e.key === 'ArrowLeft' && this.viewMode === 'list' && this.currentIndex > 0) {
                e.preventDefault();
                this.currentIndex--;
                this.updateUI();
            }
        });
    }

    switchMode(mode) {
        this.viewMode = mode;

        if (mode === 'focus') {
            this.focusModeBtn.classList.add('active');
            this.listModeBtn.classList.remove('active');
            this.sidebar.classList.remove('active');
            this.cardContainer.classList.add('focus-mode');
        } else {
            this.listModeBtn.classList.add('active');
            this.focusModeBtn.classList.remove('active');
            this.sidebar.classList.add('active');
            this.cardContainer.classList.remove('focus-mode');
        }

        this.updateUI();
    }

    handleDone() {
        if (this.queue.length === 0) return;

        // Remove current item from queue
        this.queue.splice(this.currentIndex, 1);

        // Adjust index if necessary
        if (this.currentIndex >= this.queue.length && this.currentIndex > 0) {
            this.currentIndex = this.queue.length - 1;
        }

        this.updateUI();
    }

    handleNext() {
        if (this.queue.length === 0) return;

        // Move current item to end of queue
        const currentItem = this.queue.splice(this.currentIndex, 1)[0];
        this.queue.push(currentItem);

        // Stay at same index (which now shows the next item)
        if (this.currentIndex >= this.queue.length) {
            this.currentIndex = 0;
        }

        this.updateUI();
    }

    selectCard(index) {
        this.currentIndex = index;
        this.updateUI();
    }

    updateUI() {
        // Update queue count
        this.queueCount.textContent = this.queue.length;

        // Show/hide empty state
        if (this.queue.length === 0) {
            this.emptyState.style.display = 'block';
            this.cardView.style.display = 'none';
            this.cardList.innerHTML = '';
            return;
        }

        this.emptyState.style.display = 'none';
        this.cardView.style.display = 'block';

        // Update current card
        const currentCard = this.queue[this.currentIndex];
        this.cardSource.textContent = currentCard.source;
        this.cardTime.textContent = currentCard.time;
        this.cardTitle.textContent = currentCard.title;
        this.cardContent.textContent = currentCard.content;

        // Update list view
        if (this.viewMode === 'list') {
            this.renderList();
        }
    }

    renderList() {
        this.cardList.innerHTML = '';

        this.queue.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            if (index === this.currentIndex) {
                listItem.classList.add('active');
            }

            listItem.innerHTML = `
                <div class="list-item-header">
                    <div class="list-item-source">${item.source}</div>
                    <div class="list-item-time">${item.time}</div>
                </div>
                <div class="list-item-title">${item.title}</div>
                <div class="list-item-preview">${item.content.substring(0, 60)}...</div>
            `;

            listItem.addEventListener('click', () => this.selectCard(index));
            this.cardList.appendChild(listItem);
        });
    }

    loadSampleData() {
        this.queue = [
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

        this.currentIndex = 0;
    }

    getSampleData() {
        return [
            {
                source: 'Telegram',
                time: 'Just now',
                title: 'New Message',
                content: 'This is a new sample message that has been added to the queue.'
            }
        ];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.operatorApp = new OperatorApp();
});
