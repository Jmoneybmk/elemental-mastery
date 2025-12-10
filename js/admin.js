// Admin Panel Logic - GitHub Version
let pendingChapters = [];
let pendingGallery = [];
let pendingNews = [];

document.addEventListener('DOMContentLoaded', async () => {
    setupTabs();
    setupForms();
    await loadAllManageLists();
});

// Tab Management
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
        });
    });
}

// Form Setup
function setupForms() {
    // Chapter Form
    document.getElementById('chapterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const chapter = {
            number: parseInt(document.getElementById('chapterNumber').value),
            title: document.getElementById('chapterTitle').value,
            content: document.getElementById('chapterContent').value,
            excerpt: document.getElementById('chapterExcerpt').value || null
        };
        
        const newChapter = contentManager.createChapterData(chapter);
        pendingChapters.push(newChapter);
        
        // Download updated JSON file
        const allChapters = await contentManager.getChapters();
        const updatedChapters = [...allChapters, newChapter];
        contentManager.downloadJSON('chapters', updatedChapters);
        
        showMessage('success', 'Chapter created! Upload the downloaded chapters.json file to your GitHub repository in the /data folder.');
        e.target.reset();
        
        setTimeout(() => {
            showUploadInstructions('chapters');
        }, 1000);
    });
    
    // Gallery Form
    document.getElementById('galleryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const artwork = {
            title: document.getElementById('artTitle').value,
            imageUrl: document.getElementById('artImageUrl').value,
            category: document.getElementById('artCategory').value,
            description: document.getElementById('artDescription').value || null
        };
        
        const newArt = contentManager.createGalleryData(artwork);
        pendingGallery.push(newArt);
        
        // Download updated JSON file
        const allGallery = await contentManager.getGallery();
        const updatedGallery = [...allGallery, newArt];
        contentManager.downloadJSON('gallery', updatedGallery);
        
        showMessage('success', 'Artwork created! Upload the downloaded gallery.json file to your GitHub repository in the /data folder.');
        e.target.reset();
        
        setTimeout(() => {
            showUploadInstructions('gallery');
        }, 1000);
    });
    
    // News Form
    document.getElementById('newsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const news = {
            title: document.getElementById('newsTitle').value,
            content: document.getElementById('newsContent').value
        };
        
        const newNews = contentManager.createNewsData(news);
        pendingNews.push(newNews);
        
        // Download updated JSON file
        const allNews = await contentManager.getNews();
        const updatedNews = [...allNews, newNews];
        contentManager.downloadJSON('news', updatedNews);
        
        showMessage('success', 'Update created! Upload the downloaded news.json file to your GitHub repository in the /data folder.');
        e.target.reset();
        
        setTimeout(() => {
            showUploadInstructions('news');
        }, 1000);
    });
}

// Load All Manage Lists
async function loadAllManageLists() {
    await loadChaptersManageList();
    await loadGalleryManageList();
    await loadNewsManageList();
    await loadCommentsManageList();
}

// Chapters Management
async function loadChaptersManageList() {
    const container = document.getElementById('chaptersManageList');
    const chapters = await contentManager.getChapters();
    
    if (chapters.length === 0) {
        container.innerHTML = '<div class="empty-manage"><p>No chapters published yet.</p></div>';
        return;
    }
    
    container.innerHTML = chapters.map(chapter => `
        <div class="manage-item">
            <div class="manage-item-info">
                <div class="manage-item-title">Chapter ${chapter.number}: ${escapeHtml(chapter.title)}</div>
                <div class="manage-item-meta">
                    <span>📅 ${contentManager.formatDate(chapter.publishDate)}</span>
                    <span>👁 ${chapter.views || 0} views</span>
                </div>
                <div class="manage-item-excerpt">${escapeHtml(chapter.excerpt)}</div>
            </div>
            <div class="manage-item-actions">
                <a href="read.html?id=${chapter.id}" class="admin-btn secondary small" target="_blank">👁 View</a>
                <button onclick="deleteChapter('${chapter.id}')" class="admin-btn danger small">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteChapter(id) {
    if (confirm('This will generate a new chapters.json file without this chapter. You must upload it to GitHub to complete the deletion.')) {
        const chapters = await contentManager.getChapters();
        const updatedChapters = chapters.filter(ch => ch.id !== id);
        contentManager.downloadJSON('chapters', updatedChapters);
        showMessage('success', 'Download the new chapters.json and upload it to GitHub to complete the deletion.');
        showUploadInstructions('chapters');
    }
}

// Gallery Management
async function loadGalleryManageList() {
    const container = document.getElementById('galleryManageList');
    const gallery = await contentManager.getGallery();
    
    if (gallery.length === 0) {
        container.innerHTML = '<div class="empty-manage"><p>No artwork uploaded yet.</p></div>';
        return;
    }
    
    container.innerHTML = gallery.map(art => `
        <div class="manage-item">
            <img src="${escapeHtml(art.imageUrl)}" 
                 alt="${escapeHtml(art.title)}" 
                 class="gallery-preview-img"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'250\\' height=\\'150\\'%3E%3Crect fill=\\'%231a1a2e\\' width=\\'250\\' height=\\'150\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' fill=\\'%236e6e88\\' font-size=\\'14\\'%3EImage not found%3C/text%3E%3C/svg%3E'">
            <div class="manage-item-info">
                <div class="manage-item-title">${escapeHtml(art.title)}</div>
                <div class="manage-item-meta">
                    <span>🏷 ${escapeHtml(art.category)}</span>
                </div>
                ${art.description ? `<div class="manage-item-excerpt">${escapeHtml(art.description)}</div>` : ''}
            </div>
            <div class="manage-item-actions">
                <button onclick="deleteGalleryItem('${art.id}')" class="admin-btn danger small">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteGalleryItem(id) {
    if (confirm('This will generate a new gallery.json file without this item. You must upload it to GitHub to complete the deletion.')) {
        const gallery = await contentManager.getGallery();
        const updatedGallery = gallery.filter(item => item.id !== id);
        contentManager.downloadJSON('gallery', updatedGallery);
        showMessage('success', 'Download the new gallery.json and upload it to GitHub to complete the deletion.');
        showUploadInstructions('gallery');
    }
}

// News Management
async function loadNewsManageList() {
    const container = document.getElementById('newsManageList');
    const news = await contentManager.getNews();
    
    if (news.length === 0) {
        container.innerHTML = '<div class="empty-manage"><p>No updates posted yet.</p></div>';
        return;
    }
    
    container.innerHTML = news.map(item => `
        <div class="manage-item">
            <div class="manage-item-info">
                <div class="manage-item-title">${escapeHtml(item.title)}</div>
                <div class="manage-item-meta">
                    <span>📅 ${contentManager.formatDate(item.publishDate)}</span>
                </div>
                <div class="manage-item-excerpt">${escapeHtml(truncate(item.content, 150))}</div>
            </div>
            <div class="manage-item-actions">
                <button onclick="deleteNews('${item.id}')" class="admin-btn danger small">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteNews(id) {
    if (confirm('This will generate a new news.json file without this update. You must upload it to GitHub to complete the deletion.')) {
        const news = await contentManager.getNews();
        const updatedNews = news.filter(item => item.id !== id);
        contentManager.downloadJSON('news', updatedNews);
        showMessage('success', 'Download the new news.json and upload it to GitHub to complete the deletion.');
        showUploadInstructions('news');
    }
}

// Show upload instructions modal
function showUploadInstructions(type) {
    const instructions = `
        <div class="upload-instructions">
            <h3>📤 Next Step: Upload to GitHub</h3>
            <ol>
                <li>Find the downloaded <strong>${type}.json</strong> file in your Downloads folder</li>
                <li>Go to your GitHub repository</li>
                <li>Navigate to the <strong>data</strong> folder</li>
                <li>Click "Upload files" or drag and drop <strong>${type}.json</strong></li>
                <li>Replace the existing file</li>
                <li>Scroll down and click "Commit changes"</li>
                <li>Wait 1-2 minutes for GitHub Pages to update</li>
                <li>Refresh this page to see your changes!</li>
            </ol>
            <button onclick="this.parentElement.remove()" class="admin-btn primary">Got it!</button>
        </div>
    `;
    
    const activeTab = document.querySelector('.tab-content.active');
    const existingInstructions = activeTab.querySelector('.upload-instructions');
    if (existingInstructions) {
        existingInstructions.remove();
    }
    
    const div = document.createElement('div');
    div.innerHTML = instructions;
    activeTab.insertBefore(div.firstElementChild, activeTab.firstChild);
}

// Utility Functions
function showMessage(type, text) {
    const activeTab = document.querySelector('.tab-content.active');
    const existingMessage = activeTab.querySelector('.message');
    
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    const firstSection = activeTab.querySelector('.admin-section');
    firstSection.insertBefore(message, firstSection.firstChild);
    
    setTimeout(() => {
        message.remove();
    }, 8000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
}

// Refresh button to reload data
function refreshData() {
    contentManager.clearCache();
    commentsManager.clearCache();
    loadAllManageLists();
    showMessage('success', 'Data refreshed from GitHub!');
}

// Comments Management
async function loadCommentsManageList() {
    const container = document.getElementById('commentsManageList');
    const totalCounter = document.getElementById('totalComments');
    const comments = await commentsManager.fetchComments();
    
    if (totalCounter) {
        totalCounter.textContent = comments.length;
    }
    
    if (comments.length === 0) {
        container.innerHTML = '<div class="empty-manage"><p>No comments yet.</p></div>';
        return;
    }

    // Get chapter titles for display
    const chapters = await contentManager.getChapters();
    const chapterMap = {};
    chapters.forEach(ch => {
        chapterMap[ch.id] = `Chapter ${ch.number}: ${ch.title}`;
    });

    container.innerHTML = comments.map(comment => `
        <div class="manage-item" style="background: var(--void-deep);">
            <div class="manage-item-info">
                <div class="manage-item-title">${escapeHtml(comment.displayName)}</div>
                <div class="manage-item-meta">
                    <span>📧 ${escapeHtml(comment.email)}</span>
                    <span>📅 ${commentsManager.formatDate(comment.timestamp)}</span>
                    <span>📖 ${chapterMap[comment.chapterId] || 'Unknown Chapter'}</span>
                </div>
                <div class="manage-item-excerpt">${escapeHtml(comment.comment)}</div>
            </div>
            <div class="manage-item-actions">
                <button onclick="deleteComment('${comment.id}')" class="admin-btn danger small">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteComment(id) {
    if (confirm('Delete this comment? This will immediately remove it from the website.')) {
        try {
            const comments = await commentsManager.fetchComments();
            const updatedComments = comments.filter(c => c.id !== id);
            
            // If GitHub is configured, use API
            if (commentsManager.isConfigured()) {
                // Get current file SHA
                const fileResponse = await fetch(
                    `https://api.github.com/repos/${commentsManager.githubUsername}/${commentsManager.repoName}/contents/${commentsManager.commentsFile}`,
                    {
                        headers: {
                            'Authorization': `token ${commentsManager.githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                const fileData = await fileResponse.json();
                const content = btoa(JSON.stringify(updatedComments, null, 2));
                
                // Commit deletion
                await fetch(
                    `https://api.github.com/repos/${commentsManager.githubUsername}/${commentsManager.repoName}/contents/${commentsManager.commentsFile}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${commentsManager.githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify({
                            message: 'Delete comment',
                            content: content,
                            sha: fileData.sha
                        })
                    }
                );
                
                showMessage('success', 'Comment deleted successfully!');
                commentsManager.clearCache();
                await loadCommentsManageList();
            } else {
                // Fallback: download JSON
                commentsManager.downloadCommentsJSON(updatedComments);
                showMessage('success', 'Download the new comments.json and upload it to GitHub to complete the deletion.');
                showUploadInstructions('comments');
            }
        } catch (error) {
            showMessage('error', 'Failed to delete comment: ' + error.message);
        }
    }
}