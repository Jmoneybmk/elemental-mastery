// GitHub-Based Content Management System
class GitHubContentManager {
    constructor() {
        this.dataFiles = {
            chapters: 'data/chapters.json',
            gallery: 'data/gallery.json',
            news: 'data/news.json'
        };
        this.cache = {
            chapters: null,
            gallery: null,
            news: null
        };
    }

    // Fetch data from GitHub JSON files
    async fetchData(type) {
        // Return cached data if available
        if (this.cache[type]) {
            return this.cache[type];
        }

        try {
            const response = await fetch(this.dataFiles[type]);
            if (!response.ok) {
                // If file doesn't exist yet, return empty array
                if (response.status === 404) {
                    this.cache[type] = [];
                    return [];
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.cache[type] = data;
            return data;
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            this.cache[type] = [];
            return [];
        }
    }

    // Clear cache to force refresh
    clearCache(type = null) {
        if (type) {
            this.cache[type] = null;
        } else {
            this.cache = { chapters: null, gallery: null, news: null };
        }
    }

    // CHAPTER METHODS
    async getChapters() {
        const chapters = await this.fetchData('chapters');
        return chapters.sort((a, b) => b.number - a.number);
    }

    async getChapter(id) {
        const chapters = await this.fetchData('chapters');
        return chapters.find(ch => ch.id === id) || null;
    }

    async incrementChapterViews(id) {
        const chapters = await this.fetchData('chapters');
        const chapter = chapters.find(ch => ch.id === id);
        if (chapter) {
            chapter.views = (chapter.views || 0) + 1;
            this.cache.chapters = chapters;
            // Views are tracked locally but not saved back to GitHub
            // to avoid constant commits
        }
    }

    // GALLERY METHODS
    async getGallery(category = null) {
        let gallery = await this.fetchData('gallery');
        if (category) {
            gallery = gallery.filter(item => item.category === category);
        }
        return gallery.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }

    // NEWS METHODS
    async getNews() {
        const news = await this.fetchData('news');
        return news.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    }

    // UTILITY METHODS
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateExcerpt(content, maxLength = 200) {
        const text = content.replace(/<[^>]*>/g, '').trim();
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength).trim() + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // ADMIN METHODS (for generating new content files)
    createChapterData(chapter) {
        return {
            id: this.generateId(),
            number: chapter.number || 1,
            title: chapter.title,
            content: chapter.content,
            excerpt: chapter.excerpt || this.generateExcerpt(chapter.content),
            publishDate: chapter.publishDate || new Date().toISOString(),
            views: 0
        };
    }

    createGalleryData(item) {
        return {
            id: this.generateId(),
            title: item.title,
            imageUrl: item.imageUrl,
            category: item.category || 'character',
            description: item.description || '',
            uploadDate: new Date().toISOString()
        };
    }

    createNewsData(news) {
        return {
            id: this.generateId(),
            title: news.title,
            content: news.content,
            publishDate: news.publishDate || new Date().toISOString()
        };
    }

    // Generate downloadable JSON file for manual GitHub upload
    downloadJSON(type, data) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize global content manager
const contentManager = new GitHubContentManager();