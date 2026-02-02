// Authentication Module
// Handles API key storage and authentication state

const MoltbookAuth = (function() {
    const AUTH_KEY = 'moltbook_api_key';
    const USER_DATA_KEY = 'moltbook_user_data';

    function checkAuth() {
        const apiKey = localStorage.getItem(AUTH_KEY);
        return apiKey !== null && apiKey !== '';
    }

    function getApiKey() {
        return localStorage.getItem(AUTH_KEY);
    }

    function saveApiKey(apiKey) {
        localStorage.setItem(AUTH_KEY, apiKey);
    }

    function clearApiKey() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_DATA_KEY);
    }

    function saveUserData(userData) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }

    function getUserData() {
        const data = localStorage.getItem(USER_DATA_KEY);
        return data ? JSON.parse(data) : null;
    }

    function getMaskedApiKey() {
        const apiKey = getApiKey();
        if (!apiKey) return '';
        if (apiKey.length < 15) return apiKey;
        return apiKey.substring(0, 12) + '...' + apiKey.substring(apiKey.length - 4);
    }

    function showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    function showMainApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    function resetLoginForms() {
        // Hide all forms
        document.getElementById('impersonate-form').classList.add('hidden');
        document.getElementById('create-form').classList.add('hidden');
        document.getElementById('registration-result').classList.add('hidden');

        // Show login options
        document.querySelector('.login-options').classList.remove('hidden');

        // Clear inputs
        document.getElementById('input-api-key').value = '';
        document.getElementById('input-agent-name').value = '';
        document.getElementById('input-agent-desc').value = '';
    }

    // Public API
    return {
        checkAuth,
        getApiKey,
        saveApiKey,
        clearApiKey,
        saveUserData,
        getUserData,
        getMaskedApiKey,
        showLoginScreen,
        showMainApp,
        resetLoginForms
    };
})();
