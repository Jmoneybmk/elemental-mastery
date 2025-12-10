// Comments System
class CommentsManager {
    constructor() {
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
            email: email, // Will be saved but not displayed publicly
            displayName: displayName,
            comment: commentText,
            timestamp: new Date().toISOString(),
            approved: true // Auto-approve for now
        };
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

    // For admin: download comments with emails
    downloadCommentsJSON(comments) {
        const jsonStr = JSON.stringify(comments, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'comments.json';
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize global comments manager
const commentsManager = new CommentsManager();
