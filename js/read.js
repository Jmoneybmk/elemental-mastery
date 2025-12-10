// Reading Page Logic
document.addEventListener('DOMContentLoaded', async () => {
    await loadChapter();
    setupReadingProgress();
    setupCommentForm();
});

async function loadChapter() {
    const urlParams = new URLSearchParams(window.location.search);
    const chapterId = urlParams.get('id');
    
    if (!chapterId) {
        displayNotFound();
        return;
    }
    
    const chapter = await contentManager.getChapter(chapterId);
    
    if (!chapter) {
        displayNotFound();
        return;
    }
    
    // Increment view count
    await contentManager.incrementChapterViews(chapterId);
    
    // Display chapter
    displayChapterHeader(chapter);
    displayChapterContent(chapter);
    await displayChapterNavigation(chapter);
    
    // Load comments
    await loadComments(chapterId);
    
    // Update page title
    document.title = `Chapter ${chapter.number}: ${chapter.title} - Elemental Mastery`;
}

function displayChapterHeader(chapter) {
    const container = document.getElementById('chapterHeaderContent');
    container.innerHTML = `
        <div class="chapter-number-display">Chapter ${chapter.number}</div>
        <h1 class="chapter-title-display">${escapeHtml(chapter.title)}</h1>
        <div class="chapter-metadata">
            <span>📅 ${contentManager.formatDate(chapter.publishDate)}</span>
            <span>👁 ${chapter.views || 0} views</span>
        </div>
    `;
}

function displayChapterContent(chapter) {
    const container = document.getElementById('chapterContent');
    // Convert plain text to HTML paragraphs if needed
    let content = chapter.content;
    
    // If content doesn't have HTML tags, convert line breaks to paragraphs
    if (!content.includes('<p>') && !content.includes('<div>')) {
        content = content
            .split('\n\n')
            .filter(p => p.trim())
            .map(p => `<p>${escapeHtml(p.trim())}</p>`)
            .join('\n');
    }
    
    container.innerHTML = content;
}

async function displayChapterNavigation(currentChapter) {
    const container = document.getElementById('chapterNav');
    const chapters = await contentManager.getChapters();
    
    const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
    const prevChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
    const nextChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    
    let navHTML = '<div class="nav-buttons">';
    
    if (prevChapter) {
        navHTML += `
            <a href="read.html?id=${prevChapter.id}" class="nav-btn nav-btn-prev">
                <span>Previous: Chapter ${prevChapter.number}</span>
            </a>
        `;
    } else {
        navHTML += '<div class="nav-btn disabled nav-btn-prev">No Previous Chapter</div>';
    }
    
    if (nextChapter) {
        navHTML += `
            <a href="read.html?id=${nextChapter.id}" class="nav-btn nav-btn-next">
                <span>Next: Chapter ${nextChapter.number}</span>
            </a>
        `;
    } else {
        navHTML += '<div class="nav-btn disabled nav-btn-next">No Next Chapter</div>';
    }
    
    navHTML += '</div>';
    navHTML += '<a href="chapters.html" class="nav-btn back-to-chapters" style="margin-top: 1rem;">Back to All Chapters</a>';
    
    container.innerHTML = navHTML;
}

function displayNotFound() {
    const headerContainer = document.getElementById('chapterHeaderContent');
    const contentContainer = document.getElementById('chapterContent');
    const navContainer = document.getElementById('chapterNav');
    
    headerContainer.innerHTML = '';
    contentContainer.innerHTML = `
        <div class="not-found">
            <h2>Chapter Not Found</h2>
            <p>The chapter you're looking for doesn't exist or may have been removed.</p>
            <a href="chapters.html" class="btn-primary">Return to Chapters</a>
        </div>
    `;
    navContainer.innerHTML = '';
}

function setupReadingProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        
        progressBar.style.width = progress + '%';
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        const prevBtn = document.querySelector('.nav-btn-prev:not(.disabled)');
        if (prevBtn) prevBtn.click();
    } else if (e.key === 'ArrowRight') {
        const nextBtn = document.querySelector('.nav-btn-next:not(.disabled)');
        if (nextBtn) nextBtn.click();
    }
});

// Comments Functionality
async function loadComments(chapterId) {
    const container = document.getElementById('commentsList');
    const comments = await commentsManager.getCommentsForChapter(chapterId);
    
    if (comments.length === 0) {
        container.innerHTML = `
            <div class="comments-empty">
                <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-author">${escapeHtml(comment.displayName)}</div>
                <div class="comment-date">${commentsManager.formatDate(comment.timestamp)}</div>
            </div>
            <div class="comment-text">${escapeHtml(comment.comment)}</div>
        </div>
    `).join('');
}

function setupCommentForm() {
    const form = document.getElementById('commentForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const urlParams = new URLSearchParams(window.location.search);
        const chapterId = urlParams.get('id');
        
        if (!chapterId) return;
        
        const email = document.getElementById('commentEmail').value;
        const displayName = document.getElementById('commentName').value;
        const commentText = document.getElementById('commentText').value;
        
        // Create comment data
        const newComment = commentsManager.createComment(chapterId, email, displayName, commentText);
        
        // Get all existing comments
        const allComments = await commentsManager.fetchComments();
        const updatedComments = [...allComments, newComment];
        
        // Download updated comments.json
        commentsManager.downloadCommentsJSON(updatedComments);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'comment-success';
        successMsg.textContent = 'Comment submitted! Upload the downloaded comments.json file to GitHub for it to appear.';
        
        const formContainer = document.querySelector('.comment-form-container');
        formContainer.insertBefore(successMsg, formContainer.firstChild);
        
        // Clear form
        form.reset();
        
        // Remove success message after 10 seconds
        setTimeout(() => successMsg.remove(), 10000);
    });
}