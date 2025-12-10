// Automatic Comments System - GitHub API Integration
class AutoCommentsManager {
    constructor() {
        // GitHub configuration - YOU NEED TO SET THESE
        this.githubUsername = 'Jmoneybmk'; // e.g., 'BigDomo'
        this.repoName = 'elemental-mastery'; // e.g., 'elemental-mastery'
        this.githubToken = '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'; // Get from GitHub Settings
        
        this.commentsFile = 'data/comments.json';
        this.cache = null;
    }

    async fetchComments() {
        if (this.cache) {
            return this.cache;
        }

        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`${this.commentsFile}?v=${timestamp}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    this.cache = [];
                    return [];
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.cache = data;
            return data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            this.cache = [];
            return [];
        }
    }

    async getCommentsForChapter(chapterId) {
        const allComments = await this.fetchComments();
        return allComments
            .filter(comment => comment.chapterId === chapterId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    createComment(chapterId, email, displayName, commentText) {
        return {
            id: this.generateId(),
            chapterId: chapterId,
            email: email,
            displayName: displayName,
            comment: commentText,
            timestamp: new Date().toISOString(),
            approved: true
        };
    }

    // AUTOMATIC SUBMISSION - Posts directly to GitHub
    async submitComment(chapterId, email, displayName, commentText) {
        // Check if configuration is set
        if (!this.isConfigured()) {
            throw new Error('GitHub configuration not set. Please configure in js/auto-comments.js');
        }

        try {
            // Create new comment
            const newComment = this.createComment(chapterId, email, displayName, commentText);
            
            // Get current comments
            const currentComments = await this.fetchComments();
            
            // Add new comment
            const updatedComments = [...currentComments, newComment];
            
            // Get current file from GitHub to get SHA
            const fileDataResponse = await fetch(
                `https://api.github.com/repos/${this.githubUsername}/${this.repoName}/contents/${this.commentsFile}`,
                {
                    headers: {
                        'Authorization': `token ${this.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            let sha = null;
            if (fileDataResponse.ok) {
                const fileData = await fileDataResponse.json();
                sha = fileData.sha;
            }

            // Prepare the new content
            const content = btoa(JSON.stringify(updatedComments, null, 2));

            // Commit to GitHub
            const commitResponse = await fetch(
                `https://api.github.com/repos/${this.githubUsername}/${this.repoName}/contents/${this.commentsFile}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `New comment from ${displayName}`,
                        content: content,
                        sha: sha
                    })
                }
            );

            if (!commitResponse.ok) {
                const error = await commitResponse.json();
                throw new Error(error.message || 'Failed to submit comment');
            }

            // Clear cache so new comment loads
            this.clearCache();
            
            return true;
        } catch (error) {
            console.error('Error submitting comment:', error);
            throw error;
        }
    }

    isConfigured() {
        return this.githubUsername !== 'YOUR_GITHUB_USERNAME' &&
               this.repoName !== 'YOUR_REPO_NAME' &&
               this.githubToken !== 'YOUR_GITHUB_TOKEN';
    }

    generateId() {
        return 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    clearCache() {
        this.cache = null;
    }

    // For admin: download all comments with emails
    async downloadAllComments() {
        const comments = await this.fetchComments();
        const jsonStr = JSON.stringify(comments, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `comments-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize global comments manager
const commentsManager = new AutoCommentsManager();