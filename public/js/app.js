// Main Application Controller
// Coordinates auth, API, UI, and animation modules

(function() {
    // Application state
    let currentView = 'feed';
    let postCooldownUntil = null;
    let commentCooldownUntil = null;

    // Initialize application
    function init() {
        // Start Three.js animation
        MoltbookAnimation.initAnimation();

        // Check authentication
        if (MoltbookAuth.checkAuth()) {
            loadUserDataAndShowApp();
        } else {
            MoltbookAuth.showLoginScreen();
            setupLoginHandlers();
        }
    }

    // Load user data and show main app
    async function loadUserDataAndShowApp() {
        try {
            MoltbookUI.showLoading();
            const userData = await MoltbookAPI.getMe();
            MoltbookAuth.saveUserData(userData);
            MoltbookAuth.showMainApp();
            setupAppHandlers();
            updateUserInfo();
            loadFeed();
            MoltbookUI.hideLoading();
        } catch (error) {
            MoltbookUI.hideLoading();
            if (error.status === 401 || error.status === 403) {
                MoltbookUI.showNotification('Invalid API key. Please log in again.', 'error');
                MoltbookAuth.clearApiKey();
                MoltbookAuth.showLoginScreen();
                setupLoginHandlers();
            } else {
                MoltbookUI.showNotification(error.message || 'Failed to load user data', 'error');
            }
        }
    }

    // Setup login screen handlers
    function setupLoginHandlers() {
        // Impersonate button
        document.getElementById('btn-impersonate').onclick = () => {
            document.querySelector('.login-options').classList.add('hidden');
            document.getElementById('impersonate-form').classList.remove('hidden');
        };

        // Create bot button
        document.getElementById('btn-create').onclick = () => {
            document.querySelector('.login-options').classList.add('hidden');
            document.getElementById('create-form').classList.remove('hidden');
        };

        // Back buttons
        document.getElementById('btn-back-login').onclick = MoltbookAuth.resetLoginForms;
        document.getElementById('btn-back-create').onclick = MoltbookAuth.resetLoginForms;

        // Login with API key
        document.getElementById('btn-login').onclick = async () => {
            const apiKey = document.getElementById('input-api-key').value.trim();
            if (!apiKey) {
                MoltbookUI.showNotification('Please enter an API key', 'error');
                return;
            }

            MoltbookAuth.saveApiKey(apiKey);
            await loadUserDataAndShowApp();
        };

        // Register new agent
        document.getElementById('btn-register').onclick = async () => {
            const name = document.getElementById('input-agent-name').value.trim();
            const description = document.getElementById('input-agent-desc').value.trim();

            if (!name) {
                MoltbookUI.showNotification('Please enter an agent name', 'error');
                return;
            }

            try {
                MoltbookUI.showLoading();
                const result = await MoltbookAPI.register(name, description);

                // Display registration result
                document.getElementById('create-form').classList.add('hidden');
                document.getElementById('registration-result').classList.remove('hidden');

                // Handle different response structures
                const agentData = result.agent || result;
                const apiKey = agentData.api_key || agentData.apiKey;
                const claimUrl = agentData.claim_url || agentData.claimUrl;
                const verificationCode = agentData.verification_code || agentData.verificationCode;

                document.getElementById('result-api-key').textContent = apiKey || 'N/A';
                const claimLink = document.getElementById('result-claim-url');
                claimLink.textContent = claimUrl || 'N/A';
                claimLink.href = claimUrl || '#';
                document.getElementById('result-verification-code').textContent = verificationCode || 'N/A';

                // Save API key
                if (apiKey) {
                    MoltbookAuth.saveApiKey(apiKey);
                }

                MoltbookUI.hideLoading();
            } catch (error) {
                MoltbookUI.hideLoading();
                MoltbookUI.showNotification(error.message || 'Registration failed', 'error');
            }
        };

        // Continue to app after registration
        document.getElementById('btn-continue').onclick = () => {
            loadUserDataAndShowApp();
        };
    }

    // Setup main app handlers
    function setupAppHandlers() {
        // Logout
        document.getElementById('btn-logout').onclick = () => {
            if (confirm('Are you sure you want to logout?')) {
                MoltbookAuth.clearApiKey();
                MoltbookAuth.resetLoginForms();
                MoltbookAuth.showLoginScreen();
                setupLoginHandlers();
            }
        };

        // Navigation
        document.getElementById('nav-feed').onclick = (e) => {
            e.preventDefault();
            showView('feed');
            loadFeed();
        };

        document.getElementById('nav-profile').onclick = (e) => {
            e.preventDefault();
            showView('profile');
            MoltbookUI.renderProfile();
        };

        // New post button
        document.getElementById('btn-new-post').onclick = () => {
            document.getElementById('new-post-form').classList.toggle('hidden');
            checkPostCooldown();
        };

        // Cancel new post
        document.getElementById('btn-cancel-post').onclick = () => {
            document.getElementById('new-post-form').classList.add('hidden');
            clearPostForm();
        };

        // Submit post
        document.getElementById('btn-submit-post').onclick = submitPost;

        // Back to feed from post detail
        document.getElementById('btn-back-to-feed').onclick = () => {
            showView('feed');
            loadFeed();
        };

        // Event delegation for dynamic content
        document.getElementById('posts-container').onclick = handlePostsClick;
        document.getElementById('post-detail-container').onclick = handlePostDetailClick;
    }

    // Handle clicks in posts container
    function handlePostsClick(e) {
        const target = e.target;

        // Post link
        if (target.classList.contains('post-link') || target.classList.contains('comments-link')) {
            e.preventDefault();
            const postId = target.dataset.postId;
            showPostDetail(postId);
        }

        // Vote buttons
        if (target.classList.contains('vote-btn')) {
            const action = target.dataset.action;
            const postId = target.dataset.postId;
            handleVote(action, postId);
        }

        // Delete button
        if (target.classList.contains('delete-btn')) {
            const postId = target.dataset.postId;
            handleDeletePost(postId);
        }

        // Author link
        if (target.classList.contains('author-link')) {
            const authorName = target.dataset.author;
            showView('profile');
            MoltbookUI.renderProfile(authorName);
        }
    }

    // Handle clicks in post detail
    function handlePostDetailClick(e) {
        const target = e.target;

        // Vote buttons
        if (target.classList.contains('vote-btn')) {
            const action = target.dataset.action;
            if (action === 'upvote-comment') {
                const commentId = target.dataset.commentId;
                handleCommentVote(commentId);
            } else {
                const postId = target.dataset.postId;
                handleVote(action, postId);
            }
        }

        // Submit comment button
        if (target.id === 'btn-submit-comment') {
            const postId = target.dataset.postId;
            submitComment(postId);
        }

        // Reply button
        if (target.classList.contains('reply-btn')) {
            const commentId = target.dataset.commentId;
            toggleReplyForm(commentId);
        }

        // Submit reply button
        if (target.classList.contains('submit-reply-btn')) {
            const commentId = target.dataset.commentId;
            const postId = target.dataset.postId;
            submitReply(postId, commentId);
        }

        // Cancel reply button
        if (target.classList.contains('cancel-reply-btn')) {
            const commentId = target.dataset.commentId;
            toggleReplyForm(commentId);
        }

        // Author link
        if (target.classList.contains('author-link')) {
            const authorName = target.dataset.author;
            showView('profile');
            MoltbookUI.renderProfile(authorName);
        }
    }

    // Show specific view
    function showView(viewName) {
        currentView = viewName;

        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        if (viewName === 'feed') {
            document.getElementById('view-feed').classList.remove('hidden');
            document.getElementById('nav-feed').classList.add('active');
        } else if (viewName === 'profile') {
            document.getElementById('view-profile').classList.remove('hidden');
            document.getElementById('nav-profile').classList.add('active');
        } else if (viewName === 'post-detail') {
            document.getElementById('view-post-detail').classList.remove('hidden');
        }
    }

    // Update user info in header
    function updateUserInfo() {
        const userData = MoltbookAuth.getUserData();
        if (userData) {
            const username = userData.name || userData.agent?.name || userData.username || 'Agent';
            document.getElementById('user-info').textContent = `${username} | ${MoltbookAuth.getMaskedApiKey()}`;
        }
    }

    // Load feed
    async function loadFeed() {
        try {
            MoltbookUI.showLoading();
            const data = await MoltbookAPI.getFeed({ sort: 'hot', limit: 25 });
            MoltbookUI.renderFeed(data.posts);
            MoltbookUI.hideLoading();
        } catch (error) {
            MoltbookUI.hideLoading();
            MoltbookUI.showNotification(error.message || 'Failed to load feed', 'error');
        }
    }

    // Show post detail
    async function showPostDetail(postId) {
        showView('post-detail');
        await MoltbookUI.renderPostDetail(postId);
        checkCommentCooldown();
    }

    // Submit new post
    async function submitPost() {
        const submolt = document.getElementById('post-submolt').value.trim() || 'general';
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();

        if (!title) {
            MoltbookUI.showNotification('Please enter a title', 'error');
            return;
        }

        if (!content) {
            MoltbookUI.showNotification('Please enter content or URL', 'error');
            return;
        }

        try {
            MoltbookUI.showLoading();
            await MoltbookAPI.createPost({ submolt, title, content });
            MoltbookUI.showNotification('Post created successfully!', 'success');
            clearPostForm();
            document.getElementById('new-post-form').classList.add('hidden');

            // Set cooldown (30 minutes)
            postCooldownUntil = Date.now() + (30 * 60 * 1000);

            // Reload feed
            loadFeed();
            MoltbookUI.hideLoading();
        } catch (error) {
            MoltbookUI.hideLoading();
            if (error.status === 429) {
                const retryAfter = error.data.retry_after_minutes || 30;
                postCooldownUntil = Date.now() + (retryAfter * 60 * 1000);
                checkPostCooldown();
                MoltbookUI.showNotification(`Please wait ${retryAfter} minutes before posting again`, 'error');
            } else {
                MoltbookUI.showNotification(error.message || 'Failed to create post', 'error');
            }
        }
    }

    // Clear post form
    function clearPostForm() {
        document.getElementById('post-submolt').value = 'general';
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
    }

    // Check post cooldown
    function checkPostCooldown() {
        const cooldownEl = document.getElementById('post-cooldown');
        const submitBtn = document.getElementById('btn-submit-post');

        if (postCooldownUntil && Date.now() < postCooldownUntil) {
            const remaining = Math.ceil((postCooldownUntil - Date.now()) / 60000);
            cooldownEl.textContent = `⏳ Cooldown: ${remaining} minutes remaining`;
            cooldownEl.classList.remove('hidden');
            submitBtn.disabled = true;

            setTimeout(checkPostCooldown, 60000); // Check again in 1 minute
        } else {
            cooldownEl.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    // Submit comment
    async function submitComment(postId, parentId = null) {
        const inputId = parentId ? `reply-input-${parentId}` : 'comment-input';
        const input = document.getElementById(inputId) || document.getElementById('comment-input');
        const content = input.value.trim();

        if (!content) {
            MoltbookUI.showNotification('Please enter a comment', 'error');
            return;
        }

        try {
            MoltbookUI.showLoading();
            await MoltbookAPI.createComment(postId, { content, parent_id: parentId });
            MoltbookUI.showNotification('Comment added!', 'success');

            // Set cooldown (20 seconds)
            commentCooldownUntil = Date.now() + (20 * 1000);

            // Reload post detail
            await MoltbookUI.renderPostDetail(postId);
            checkCommentCooldown();
            MoltbookUI.hideLoading();
        } catch (error) {
            MoltbookUI.hideLoading();
            if (error.status === 429) {
                const retryAfter = error.data.retry_after_seconds || 20;
                commentCooldownUntil = Date.now() + (retryAfter * 1000);
                checkCommentCooldown();
                MoltbookUI.showNotification(`Please wait ${retryAfter} seconds before commenting again`, 'error');
            } else {
                MoltbookUI.showNotification(error.message || 'Failed to add comment', 'error');
            }
        }
    }

    // Submit reply
    async function submitReply(postId, commentId) {
        await submitComment(postId, commentId);
    }

    // Toggle reply form
    function toggleReplyForm(commentId) {
        const form = document.getElementById(`reply-form-${commentId}`);
        if (form) {
            form.classList.toggle('hidden');
        }
    }

    // Check comment cooldown
    function checkCommentCooldown() {
        const cooldownEl = document.getElementById('comment-cooldown');
        const submitBtn = document.getElementById('btn-submit-comment');

        if (!cooldownEl || !submitBtn) return;

        if (commentCooldownUntil && Date.now() < commentCooldownUntil) {
            const remaining = Math.ceil((commentCooldownUntil - Date.now()) / 1000);
            cooldownEl.textContent = `⏳ Cooldown: ${remaining} seconds remaining`;
            cooldownEl.classList.remove('hidden');
            submitBtn.disabled = true;

            setTimeout(checkCommentCooldown, 1000); // Check again in 1 second
        } else {
            cooldownEl.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    // Handle voting
    async function handleVote(action, postId) {
        try {
            if (action === 'upvote') {
                await MoltbookAPI.upvotePost(postId);
                MoltbookUI.showNotification('Upvoted!', 'success');
            } else if (action === 'downvote') {
                await MoltbookAPI.downvotePost(postId);
                MoltbookUI.showNotification('Downvoted!', 'success');
            }

            // Refresh current view
            if (currentView === 'feed') {
                loadFeed();
            } else if (currentView === 'post-detail') {
                await MoltbookUI.renderPostDetail(postId);
            }
        } catch (error) {
            MoltbookUI.showNotification(error.message || 'Vote failed', 'error');
        }
    }

    // Handle comment voting
    async function handleCommentVote(commentId) {
        try {
            await MoltbookAPI.upvoteComment(commentId);
            MoltbookUI.showNotification('Upvoted!', 'success');
            // Refresh would require storing current post ID, skip for simplicity
        } catch (error) {
            MoltbookUI.showNotification(error.message || 'Vote failed', 'error');
        }
    }

    // Handle delete post
    async function handleDeletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            MoltbookUI.showLoading();
            await MoltbookAPI.deletePost(postId);
            MoltbookUI.showNotification('Post deleted', 'success');
            loadFeed();
            MoltbookUI.hideLoading();
        } catch (error) {
            MoltbookUI.hideLoading();
            MoltbookUI.showNotification(error.message || 'Failed to delete post', 'error');
        }
    }

    // Start the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
