// Home Page Display Logic
document.addEventListener('DOMContentLoaded', () => {
    displayLatestChapter();
    displayFeaturedArt();
    displayLatestNews();
});

function displayLatestChapter() {
    const container = document.getElementById('latestChapterDisplay');
    const chapters = contentManager.getChapters();
    
    if (chapters.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <p>No chapters published yet. Check back soon!</p>
                <a href="admin.html" class="btn-primary" style="margin-top: 1rem;">Publish Your First Chapter</a>
            </div>
        `;
        return;
    }

    const latest = chapters[0];
    container.innerHTML = `
        <div class="chapter-number">Chapter ${latest.number}</div>
        <h3 class="chapter-preview-title">${escapeHtml(latest.title)}</h3>
        <div class="chapter-preview-excerpt">${escapeHtml(latest.excerpt)}</div>
        <div class="chapter-meta">
            <span class="chapter-date">${contentManager.formatDate(latest.publishDate)}</span>
            <a href="read.html?id=${latest.id}" class="btn-primary">Read Chapter</a>
        </div>
    `;
}

function displayFeaturedArt() {
    const container = document.getElementById('featuredArtDisplay');
    const gallery = contentManager.getGallery();
    
    if (gallery.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <p>No artwork uploaded yet.</p>
            </div>
        `;
        return;
    }

    const featured = gallery.slice(0, 3);
    container.innerHTML = featured.map(art => `
        <div class="art-card">
            <img src="${escapeHtml(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="art-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\'%3E%3Crect fill=\\'%231a1a2e\\' width=\\'300\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' fill=\\'%236e6e88\\' font-size=\\'18\\'%3EImage not found%3C/text%3E%3C/svg%3E'">
            <div class="art-info">
                <div class="art-category">${escapeHtml(art.category)}</div>
                <h3 class="art-title">${escapeHtml(art.title)}</h3>
                ${art.description ? `<p class="art-description">${escapeHtml(art.description)}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function displayLatestNews() {
    const container = document.getElementById('latestNewsDisplay');
    const news = contentManager.getNews();
    
    if (news.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <p>No updates yet.</p>
            </div>
        `;
        return;
    }

    const latest = news.slice(0, 3);
    container.innerHTML = latest.map(item => `
        <div class="news-card">
            <div class="news-date">${contentManager.formatDate(item.publishDate)}</div>
            <h3 class="news-title">${escapeHtml(item.title)}</h3>
            <div class="news-content">${escapeHtml(item.content)}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
