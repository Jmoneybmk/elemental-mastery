// News Page Logic
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
});

function loadNews() {
    const container = document.getElementById('newsTimeline');
    const news = contentManager.getNews();
    
    if (news.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Updates Yet</h3>
                <p>News and updates will appear here.</p>
                <a href="admin.html" class="btn-primary">Post First Update</a>
            </div>
        `;
        return;
    }

    container.innerHTML = news.map(item => `
        <div class="news-item">
            <div class="news-item-card">
                <div class="news-item-date">${contentManager.formatDate(item.publishDate)}</div>
                <h2 class="news-item-title">${escapeHtml(item.title)}</h2>
                <div class="news-item-content">${formatNewsContent(item.content)}</div>
            </div>
        </div>
    `).join('');
}

function formatNewsContent(content) {
    // Convert plain text to paragraphs
    return content
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${escapeHtml(p.trim())}</p>`)
        .join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
