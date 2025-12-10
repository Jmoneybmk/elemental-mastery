// Chapters Page Logic
document.addEventListener('DOMContentLoaded', async () => {
    await loadChapters();
});

async function loadChapters() {
    const chapters = await contentManager.getChapters();
    
    if (chapters.length === 0) {
        displayEmptyState();
        return;
    }

    // Display latest chapter preview
    displayLatestPreview(chapters[0]);
    
    // Display rest of chapters
    displayChaptersList(chapters.slice(1));
}

function displayLatestPreview(chapter) {
    const container = document.getElementById('latestChapterPreview');
    container.innerHTML = `
        <div class="chapter-preview-card">
            <div class="chapter-number">Chapter ${chapter.number}</div>
            <h2 class="chapter-preview-title">${escapeHtml(chapter.title)}</h2>
            <div class="chapter-preview-excerpt">${escapeHtml(chapter.excerpt)}</div>
            <div class="chapter-meta">
                <span class="chapter-date">${contentManager.formatDate(chapter.publishDate)}</span>
                <a href="read.html?id=${chapter.id}" class="btn-primary">Start Reading</a>
            </div>
        </div>
    `;
}

function displayChaptersList(chapters) {
    const container = document.getElementById('chaptersGrid');
    
    if (chapters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>More chapters coming soon!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = chapters.map(chapter => `
        <div class="chapter-card" onclick="goToChapter('${chapter.id}')">
            <div class="chapter-card-header">
                <div class="chapter-card-number">Chapter ${chapter.number}</div>
                <div class="chapter-views">${chapter.views || 0}</div>
            </div>
            <h3 class="chapter-card-title">${escapeHtml(chapter.title)}</h3>
            <div class="chapter-card-excerpt">${escapeHtml(chapter.excerpt)}</div>
            <div class="chapter-card-footer">
                <span class="chapter-card-date">${contentManager.formatDate(chapter.publishDate)}</span>
                <a href="read.html?id=${chapter.id}" class="read-btn" onclick="event.stopPropagation()">Read →</a>
            </div>
        </div>
    `).join('');
}

function displayEmptyState() {
    document.getElementById('latestChapterPreview').innerHTML = '';
    document.getElementById('chaptersGrid').innerHTML = `
        <div class="empty-state">
            <h3>No Chapters Yet</h3>
            <p>The story begins soon. Check back for the first chapter!</p>
        </div>
    `;
}

function goToChapter(id) {
    window.location.href = `read.html?id=${id}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}