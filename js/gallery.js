// Gallery Page Logic
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    setupFilters();
    await loadGallery();
    setupLightbox();
});

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update category and reload
            currentCategory = btn.dataset.category;
            await loadGallery();
        });
    });
}

async function loadGallery() {
    const container = document.getElementById('galleryGrid');
    const gallery = currentCategory === 'all' 
        ? await contentManager.getGallery() 
        : await contentManager.getGallery(currentCategory);
    
    if (gallery.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>No Artwork Yet</h3>
                <p>Gallery items will appear here once uploaded.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = gallery.map(art => `
        <div class="art-card" onclick="openLightbox('${art.id}')">
            <img src="${escapeHtml(art.imageUrl)}" 
                 alt="${escapeHtml(art.title)}" 
                 class="art-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\'%3E%3Crect fill=\\'%231a1a2e\\' width=\\'300\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' fill=\\'%236e6e88\\' font-size=\\'18\\'%3EImage not found%3C/text%3E%3C/svg%3E'">
            <div class="art-info">
                <div class="art-category">${escapeHtml(art.category)}</div>
                <h3 class="art-title">${escapeHtml(art.title)}</h3>
                ${art.description ? `<p class="art-description">${escapeHtml(art.description)}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const overlay = lightbox.querySelector('.lightbox-overlay');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    
    // Close on overlay click
    overlay.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display !== 'none') {
            closeLightbox();
        }
    });
}

async function openLightbox(artId) {
    const gallery = await contentManager.getGallery();
    const art = gallery.find(item => item.id === artId);
    
    if (!art) return;
    
    const lightbox = document.getElementById('lightbox');
    const image = lightbox.querySelector('.lightbox-image');
    const title = lightbox.querySelector('.lightbox-title');
    const description = lightbox.querySelector('.lightbox-description');
    
    image.src = art.imageUrl;
    image.alt = art.title;
    title.textContent = art.title;
    description.textContent = art.description || '';
    
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}