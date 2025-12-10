// Admin Panel Logic
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupForms();
    loadAllManageLists();
});

// Tab Management
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update active states
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
    document.getElementById('chapterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const chapter = {
            number: parseInt(document.getElementById('chapterNumber').value),
            title: document.getElementById('chapterTitle').value,
            content: document.getElementById('chapterContent').value,
            excerpt: document.getElementById('chapterExcerpt').value || null
        };
        
        const result = contentManager.addChapter(chapter);
        
        if (result) {
            showMessage('success', 'Chapter published successfully!');
            e.target.reset();
            loadChaptersManageList();
        } else {
            showMessage('error', 'Failed to publish chapter. Please try again.');
        }
    });
    
    // Gallery Form
    document.getElementById('galleryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const artwork = {
            title: document.getElementById('artTitle').value,
            imageUrl: document.getElementById('artImageUrl').value,
            category: document.getElementById('artCategory').value,
            description: document.getElementById('artDescription').value || null
        };
        
        const result = contentManager.addGalleryItem(artwork);
        
        if (result) {
            showMessage('success', 'Artwork added to gallery!');
            e.target.reset();
            loadGalleryManageList();
        } else {
            showMessage('error', 'Failed to add artwork. Please try again.');
        }
    });
    
    // News Form
    document.getElementById('newsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const news = {
            title: document.getElementById('newsTitle').value,
            content: document.getElementById('newsContent').value
        };
        
        const result = contentManager.addNews(news);
        
        if (result) {
            showMessage('success', 'Update published successfully!');
            e.target.reset();
            loadNewsManageList();
        } else {
            showMessage('error', 'Failed to publish update. Please try again.');
        }
    });
}

// Load All Manage Lists
function loadAllManageLists() {
    loadChaptersManageList();
    loadGalleryManageList();
    loadNewsManageList();
}

// Chapters Management
function loadChaptersManageList() {
    const container = document.getElementById('chaptersManageList');
    const chapters = contentManager.getChapters();
    
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

function deleteChapter(id) {
    if (confirm('Are you sure you want to delete this chapter? This cannot be undone!')) {
        if (contentManager.deleteChapter(id)) {
            showMessage('success', 'Chapter deleted successfully.');
            loadChaptersManageList();
        } else {
            showMessage('error', 'Failed to delete chapter.');
        }
    }
}

// Gallery Management
function loadGalleryManageList() {
    const container = document.getElementById('galleryManageList');
    const gallery = contentManager.getGallery();
    
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

function deleteGalleryItem(id) {
    if (confirm('Are you sure you want to delete this artwork?')) {
        if (contentManager.deleteGalleryItem(id)) {
            showMessage('success', 'Artwork deleted successfully.');
            loadGalleryManageList();
        } else {
            showMessage('error', 'Failed to delete artwork.');
        }
    }
}

// News Management
function loadNewsManageList() {
    const container = document.getElementById('newsManageList');
    const news = contentManager.getNews();
    
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

function deleteNews(id) {
    if (confirm('Are you sure you want to delete this update?')) {
        if (contentManager.deleteNews(id)) {
            showMessage('success', 'Update deleted successfully.');
            loadNewsManageList();
        } else {
            showMessage('error', 'Failed to delete update.');
        }
    }
}

// Import Data
function importData() {
    const input = document.getElementById('importFile');
    input.click();
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const jsonData = event.target.result;
            if (contentManager.importData(jsonData)) {
                showMessage('success', 'Data imported successfully!');
                loadAllManageLists();
            } else {
                showMessage('error', 'Failed to import data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    };
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
    
    activeTab.insertBefore(message, activeTab.firstChild);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
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
