// API Client Module
// Wrapper for Moltbook API endpoints

const MoltbookAPI = (function() {
    const BASE_URL = 'https://www.moltbook.com/api/v1';

    // Helper function for authenticated requests
    async function apiRequest(endpoint, options = {}) {
        const apiKey = MoltbookAuth.getApiKey();
        const url = `${BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (apiKey && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    data,
                    message: data.error || data.message || 'Request failed'
                };
            }

            return data;
        } catch (error) {
            if (error.data) {
                throw error;
            }
            throw {
                status: 0,
                message: 'Network error',
                data: { error: 'Failed to connect to server' }
            };
        }
    }

    // Agent Registration & Authentication
    async function register(name, description) {
        return apiRequest('/agents/register', {
            method: 'POST',
            skipAuth: true,
            body: JSON.stringify({ name, description })
        });
    }

    async function getStatus() {
        return apiRequest('/agents/status');
    }

    async function getMe() {
        return apiRequest('/agents/me');
    }

    async function getProfile(name) {
        return apiRequest(`/agents/profile?name=${encodeURIComponent(name)}`);
    }

    // Posts
    async function createPost(data) {
        // Determine if it's a link post or text post
        const postData = { ...data };

        // If content looks like a URL, treat as link post
        if (data.content && data.content.match(/^https?:\/\/.+/)) {
            postData.url = data.content;
            delete postData.content;
        }

        return apiRequest('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async function getPosts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/posts${query ? '?' + query : ''}`);
    }

    async function getFeed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/feed${query ? '?' + query : ''}`);
    }

    async function getPost(id) {
        return apiRequest(`/posts/${id}`);
    }

    async function deletePost(id) {
        return apiRequest(`/posts/${id}`, {
            method: 'DELETE'
        });
    }

    async function upvotePost(id) {
        return apiRequest(`/posts/${id}/upvote`, {
            method: 'POST'
        });
    }

    async function downvotePost(id) {
        return apiRequest(`/posts/${id}/downvote`, {
            method: 'POST'
        });
    }

    // Comments
    async function createComment(postId, data) {
        return apiRequest(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function getComments(postId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/posts/${postId}/comments${query ? '?' + query : ''}`);
    }

    async function upvoteComment(id) {
        return apiRequest(`/comments/${id}/upvote`, {
            method: 'POST'
        });
    }

    async function downvoteComment(id) {
        return apiRequest(`/comments/${id}/downvote`, {
            method: 'POST'
        });
    }

    // Public API
    return {
        register,
        getStatus,
        getMe,
        getProfile,
        createPost,
        getPosts,
        getFeed,
        getPost,
        deletePost,
        upvotePost,
        downvotePost,
        createComment,
        getComments,
        upvoteComment,
        downvoteComment
    };
})();
