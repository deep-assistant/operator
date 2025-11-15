// Authentication utilities for various platforms

class AuthManager {
    constructor(platform) {
        this.platform = platform;
        this.tokenKey = `${platform}_access_token`;
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    clearToken() {
        localStorage.removeItem(this.tokenKey);
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

// GitHub OAuth Configuration
const GitHubAuth = {
    clientId: 'YOUR_GITHUB_CLIENT_ID', // Replace with your GitHub OAuth App Client ID
    redirectUri: window.location.origin + window.location.pathname,
    scope: 'repo read:user',

    authorize() {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(this.scope)}`;
        window.location.href = authUrl;
    },

    handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // In a real app, exchange code for token on your backend
            // For demo purposes, we'll simulate authentication
            console.log('GitHub OAuth code received:', code);
            return code;
        }
        return null;
    }
};

// Telegram Auth Configuration
const TelegramAuth = {
    botToken: 'YOUR_BOT_TOKEN', // Replace with your Telegram Bot Token

    async authenticate(phone) {
        // This is a simplified example
        // In reality, you'd use Telegram's MTProto protocol or Bot API
        console.log('Telegram authentication for:', phone);
        return {
            success: true,
            message: 'Demo mode: Authentication simulated'
        };
    }
};

// VK API Configuration
const VKAuth = {
    appId: 'YOUR_VK_APP_ID', // Replace with your VK App ID
    redirectUri: window.location.origin + window.location.pathname,

    authorize() {
        const authUrl = `https://oauth.vk.com/authorize?client_id=${this.appId}&display=page&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=messages&response_type=token&v=5.131`;
        window.location.href = authUrl;
    },

    handleCallback() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');

        if (token) {
            return token;
        }
        return null;
    }
};

// X (Twitter) OAuth Configuration
const XAuth = {
    // X API v2 requires OAuth 2.0 PKCE flow
    clientId: 'YOUR_X_CLIENT_ID', // Replace with your X API Client ID
    redirectUri: window.location.origin + window.location.pathname,
    scope: 'tweet.read users.read dm.read dm.write',

    async authorize() {
        // Generate code verifier and challenge for PKCE
        const codeVerifier = this.generateCodeVerifier();
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        sessionStorage.setItem('x_code_verifier', codeVerifier);

        const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(this.scope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        window.location.href = authUrl;
    },

    generateCodeVerifier() {
        const array = new Uint32Array(28);
        crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    },

    async generateCodeChallenge(verifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hash)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    },

    handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            return code;
        }
        return null;
    }
};

// Mock data generators for demos
const MockDataGenerators = {
    github: {
        generateIssues(count = 5) {
            const issues = [];
            const titles = [
                'Bug: Login form not responsive on mobile',
                'Feature Request: Add dark mode support',
                'Performance: Slow API response times',
                'Documentation: Update installation guide',
                'Security: Update dependencies with vulnerabilities'
            ];
            const bodies = [
                'The login form breaks on screens smaller than 768px. Please investigate and fix.',
                'It would be great to have a dark mode option. Many users have requested this feature.',
                'API endpoints are taking 3-5 seconds to respond. This needs optimization.',
                'The installation guide is outdated and missing steps for the new version.',
                'Several dependencies have known security vulnerabilities and need to be updated.'
            ];

            for (let i = 0; i < count; i++) {
                issues.push({
                    number: 100 + i,
                    title: titles[i % titles.length],
                    body: bodies[i % bodies.length],
                    user: {
                        login: `user${i + 1}`,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
                    },
                    created_at: new Date(Date.now() - i * 3600000).toISOString(),
                    labels: i % 2 === 0 ? ['bug'] : ['enhancement'],
                    state: 'open'
                });
            }
            return issues;
        },

        generatePullRequests(count = 3) {
            const prs = [];
            const titles = [
                'Fix responsive layout issues',
                'Add TypeScript support',
                'Refactor authentication module'
            ];

            for (let i = 0; i < count; i++) {
                prs.push({
                    number: 50 + i,
                    title: titles[i % titles.length],
                    body: 'This PR addresses the issues mentioned in the related issue.',
                    user: {
                        login: `contributor${i + 1}`,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=pr${i}`
                    },
                    created_at: new Date(Date.now() - i * 7200000).toISOString(),
                    state: 'open'
                });
            }
            return prs;
        }
    },

    telegram: {
        generateMessages(count = 8) {
            const messages = [];
            const senders = ['Alex', 'Maria', 'John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa'];
            const texts = [
                'Hey! Did you see the presentation I sent yesterday?',
                'Can we schedule a meeting for tomorrow?',
                'The project deadline has been moved to next week.',
                'I have a quick question about the API integration.',
                'Thanks for your help with the bug fix!',
                'Are you available for a quick call?',
                'I sent you the updated design files.',
                'Let me know if you need any clarification.'
            ];

            for (let i = 0; i < count; i++) {
                messages.push({
                    id: i + 1,
                    from: {
                        id: 1000 + i,
                        first_name: senders[i % senders.length],
                        username: senders[i % senders.length].toLowerCase()
                    },
                    text: texts[i % texts.length],
                    date: Math.floor(Date.now() / 1000) - (i * 3600),
                    unread: true
                });
            }
            return messages;
        }
    },

    vk: {
        generateMessages(count = 8) {
            const messages = [];
            const senders = ['Dmitry', 'Anna', 'Pavel', 'Olga', 'Igor', 'Natalia', 'Sergey', 'Elena'];
            const texts = [
                'Привет! Как дела?',
                'Ты видел новости о проекте?',
                'Давай встретимся завтра?',
                'Отправил тебе документы.',
                'Спасибо за помощь!',
                'Можешь позвонить?',
                'Нужна твоя консультация.',
                'Всё готово к презентации.'
            ];

            for (let i = 0; i < count; i++) {
                messages.push({
                    id: i + 1,
                    user_id: 2000 + i,
                    from_id: 2000 + i,
                    text: texts[i % texts.length],
                    date: Math.floor(Date.now() / 1000) - (i * 3600),
                    first_name: senders[i % senders.length],
                    read_state: 0
                });
            }
            return messages;
        }
    },

    x: {
        generateDMs(count = 6) {
            const messages = [];
            const senders = ['TechExpert', 'DesignPro', 'CodeMaster', 'DataScience', 'DevOps', 'UXDesigner'];
            const texts = [
                'Thanks for the follow! Would love to collaborate.',
                'Your recent thread was really insightful.',
                'Can I ask you about your tech stack?',
                'Great work on your latest project!',
                'Would you be interested in a partnership?',
                'I have a question about your open source project.'
            ];

            for (let i = 0; i < count; i++) {
                messages.push({
                    id: `dm_${i + 1}`,
                    sender: {
                        id: `user_${3000 + i}`,
                        username: senders[i % senders.length],
                        name: senders[i % senders.length],
                        profile_image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=x${i}`
                    },
                    text: texts[i % texts.length],
                    created_at: new Date(Date.now() - i * 7200000).toISOString(),
                    read: false
                });
            }
            return messages;
        }
    }
};
