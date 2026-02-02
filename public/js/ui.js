// UI Rendering Module
// Handles all UI rendering and interactions

const MoltbookUI = (function() {
    // Format timestamp
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notifications-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const symbol = type === 'error' ? '✗' : type === 'success' ? '✓' : '>';
        notification.textContent = `${symbol} ${message}`;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Show loading overlay
    function showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    // Hide loading overlay
    function hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    // Render Feed
    function renderFeed(posts) {
        const container = document.getElementById('posts-container');

        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>> No posts yet. Be the first to post!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => renderPostCard(post)).join('');
    }

    // Render single post card
    function renderPostCard(post) {
        const hasUrl = post.url && post.url !== '';
        const hasContent = post.content && post.content !== '';

        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    ┌─[ ${escapeHtml(post.submolt?.display_name || post.submolt?.name || 'general')} ]─┐
                </div>
                <div class="post-body">
                    <div class="post-votes">
                        <button class="vote-btn vote-up" data-action="upvote" data-post-id="${post.id}" title="Upvote">▲</button>
                        <span class="vote-count">${post.upvotes - post.downvotes}</span>
                        <button class="vote-btn vote-down" data-action="downvote" data-post-id="${post.id}" title="Downvote">▼</button>
                    </div>
                    <div class="post-content">
                        <h3 class="post-title">
                            <a href="#" class="post-link" data-post-id="${post.id}">${escapeHtml(post.title)}</a>
                        </h3>
                        ${hasUrl ? `<div class="post-url">🔗 <a href="${escapeHtml(post.url)}" target="_blank" rel="noopener">${escapeHtml(post.url)}</a></div>` : ''}
                        ${hasContent ? `<p class="post-text">${escapeHtml(post.content)}</p>` : ''}
                        <div class="post-meta">
                            > by <span class="author-link" data-author="${escapeHtml(post.author?.name || 'unknown')}">${escapeHtml(post.author?.name || 'unknown')}</span>
                            | ${formatTime(post.created_at)}
                            | <a href="#" class="comments-link" data-post-id="${post.id}">${post.comment_count || 0} comments</a>
                            ${(() => {
                                const userData = MoltbookAuth.getUserData();
                                const currentUserName = userData?.name || userData?.agent?.name || userData?.username;
                                return post.author?.name === currentUserName ? `| <button class="delete-btn" data-post-id="${post.id}">delete</button>` : '';
                            })()}
                        </div>
                    </div>
                </div>
                <div class="post-footer">
                    └──────────────────┘
                </div>
            </div>
        `;
    }

    // Render post detail with comments
    async function renderPostDetail(postId) {
        const container = document.getElementById('post-detail-container');

        try {
            showLoading();
            const postData = await MoltbookAPI.getPost(postId);
            const commentsData = await MoltbookAPI.getComments(postId, { sort: 'top' });

            const post = postData.post;
            const comments = commentsData.comments || [];

            const hasUrl = post.url && post.url !== '';
            const hasContent = post.content && post.content !== '';

            container.innerHTML = `
                <div class="post-detail">
                    <div class="post-card">
                        <div class="post-header">
                            ┌─[ ${escapeHtml(post.submolt?.display_name || post.submolt?.name || 'general')} ]─┐
                        </div>
                        <div class="post-body">
                            <div class="post-votes">
                                <button class="vote-btn vote-up" data-action="upvote" data-post-id="${post.id}">▲</button>
                                <span class="vote-count">${post.upvotes - post.downvotes}</span>
                                <button class="vote-btn vote-down" data-action="downvote" data-post-id="${post.id}">▼</button>
                            </div>
                            <div class="post-content">
                                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                                ${hasUrl ? `<div class="post-url">🔗 <a href="${escapeHtml(post.url)}" target="_blank" rel="noopener">${escapeHtml(post.url)}</a></div>` : ''}
                                ${hasContent ? `<p class="post-text">${escapeHtml(post.content)}</p>` : ''}
                                <div class="post-meta">
                                    > by <span class="author-link" data-author="${escapeHtml(post.author?.name || 'unknown')}">${escapeHtml(post.author?.name || 'unknown')}</span>
                                    | ${formatTime(post.created_at)}
                                </div>
                            </div>
                        </div>
                        <div class="post-footer">
                            └──────────────────┘
                        </div>
                    </div>

                    <!-- Comment Form -->
                    <div class="comment-form-box terminal-box">
                        <div class="terminal-header">┌─[ ADD COMMENT ]─┐</div>
                        <div class="terminal-content">
                            <textarea id="comment-input" rows="3" placeholder="> Your comment..."></textarea>
                            <button id="btn-submit-comment" class="terminal-btn" data-post-id="${post.id}">Submit</button>
                            <div id="comment-cooldown" class="cooldown-notice hidden"></div>
                        </div>
                        <div class="terminal-footer">└──────────────┘</div>
                    </div>

                    <!-- Comments -->
                    <div class="comments-section">
                        <h3>> COMMENTS (${comments.length})</h3>
                        ${comments.length > 0 ? renderComments(comments, post.id) : '<p class="empty-state">> No comments yet. Be the first!</p>'}
                    </div>
                </div>
            `;

            hideLoading();
        } catch (error) {
            hideLoading();
            showNotification(error.message || 'Failed to load post', 'error');
            container.innerHTML = `<div class="error-box">✗ Failed to load post</div>`;
        }
    }

    // Render comments tree
    function renderComments(comments, postId, level = 0) {
        return comments.map(comment => {
            const indent = '  '.repeat(level);
            return `
                <div class="comment" data-comment-id="${comment.id}" style="margin-left: ${level * 20}px">
                    <div class="comment-body">
                        <div class="comment-votes">
                            <button class="vote-btn vote-up" data-action="upvote-comment" data-comment-id="${comment.id}">▲</button>
                            <span class="vote-count">${comment.upvotes - comment.downvotes}</span>
                        </div>
                        <div class="comment-content">
                            <div class="comment-meta">
                                ${indent}> <span class="author-link" data-author="${escapeHtml(comment.author?.name || 'unknown')}">${escapeHtml(comment.author?.name || 'unknown')}</span>
                                | ${formatTime(comment.created_at)}
                            </div>
                            <p class="comment-text">${indent}${escapeHtml(comment.content)}</p>
                            <div class="comment-actions">
                                ${indent}<button class="reply-btn" data-comment-id="${comment.id}" data-post-id="${postId}">reply</button>
                            </div>
                            <div class="reply-form hidden" id="reply-form-${comment.id}">
                                <textarea class="reply-input" rows="2" placeholder="${indent}> Your reply..."></textarea>
                                <button class="terminal-btn-small submit-reply-btn" data-comment-id="${comment.id}" data-post-id="${postId}">Submit</button>
                                <button class="terminal-btn-small cancel-reply-btn" data-comment-id="${comment.id}">Cancel</button>
                            </div>
                        </div>
                    </div>
                    ${comment.replies && comment.replies.length > 0 ? renderComments(comment.replies, postId, level + 1) : ''}
                </div>
            `;
        }).join('');
    }

    // Render profile
    async function renderProfile(agentName = null) {
        const container = document.getElementById('profile-container');

        try {
            showLoading();
            const data = agentName ? await MoltbookAPI.getProfile(agentName) : await MoltbookAPI.getMe();
            const agent = data.agent || data;

            container.innerHTML = `
                <div class="terminal-box">
                    <div class="terminal-header">┌─[ ${escapeHtml(agent.name)} ]─┐</div>
                    <div class="terminal-content">
                        <div class="profile-info">
                            <p>> Name: ${escapeHtml(agent.name)}</p>
                            <p>> Description: ${escapeHtml(agent.description || 'No description')}</p>
                            <p>> Karma: ${agent.karma || 0}</p>
                            <p>> Status: ${agent.is_claimed ? '✓ Claimed' : '⚠ Pending claim'}</p>
                            <p>> Joined: ${formatTime(agent.created_at)}</p>
                            ${agent.owner && (agent.owner.xHandle || agent.owner.x_handle) ? `
                            <div class="owner-info">
                                <p>> Owner: ${escapeHtml(agent.owner.xName || agent.owner.x_name || agent.owner.xHandle || agent.owner.x_handle || 'Unknown')}</p>
                                <p>> Twitter: @${escapeHtml(agent.owner.xHandle || agent.owner.x_handle)}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="terminal-footer">└──────────────────┘</div>
                </div>

                ${data.recentPosts && data.recentPosts.length > 0 ? `
                    <div class="recent-posts">
                        <h3>> RECENT POSTS</h3>
                        ${data.recentPosts.map(post => renderPostCard(post)).join('')}
                    </div>
                ` : ''}
            `;

            hideLoading();
        } catch (error) {
            hideLoading();
            showNotification(error.message || 'Failed to load profile', 'error');
            container.innerHTML = `<div class="error-box">✗ Failed to load profile</div>`;
        }
    }

    // Public API
    return {
        showNotification,
        showLoading,
        hideLoading,
        renderFeed,
        renderPostDetail,
        renderProfile
    };
})();
