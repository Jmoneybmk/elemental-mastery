// Content Management System - LocalStorage Based
class ContentManager {
    constructor() {
        this.storageKey = 'voidWalkerContent';
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                chapters: [],
                gallery: [],
                news: [],
                settings: {
                    siteName: 'Elemental Mastery: The Void Walker',
                    lastUpdated: new Date().toISOString()
                }
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    getData() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey));
        } catch (e) {
            console.error('Error reading data:', e);
            return null;
        }
    }

    saveData(data) {
        try {
            data.settings.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            return false;
        }
    }

    // Chapter Methods
    getChapters() {
        const data = this.getData();
        return data ? data.chapters.sort((a, b) => b.number - a.number) : [];
    }

    getChapter(id) {
        const data = this.getData();
        return data ? data.chapters.find(ch => ch.id === id) : null;
    }

    addChapter(chapter) {
        const data = this.getData();
        if (!data) return false;

        const newChapter = {
            id: this.generateId(),
            number: chapter.number || data.chapters.length + 1,
            title: chapter.title,
            content: chapter.content,
            excerpt: chapter.excerpt || this.generateExcerpt(chapter.content),
            publishDate: chapter.publishDate || new Date().toISOString(),
            views: 0
        };

        data.chapters.push(newChapter);
        return this.saveData(data) ? newChapter : null;
    }

    updateChapter(id, updates) {
        const data = this.getData();
        if (!data) return false;

        const index = data.chapters.findIndex(ch => ch.id === id);
        if (index === -1) return false;

        data.chapters[index] = { ...data.chapters[index], ...updates };
        return this.saveData(data);
    }

    deleteChapter(id) {
        const data = this.getData();
        if (!data) return false;

        data.chapters = data.chapters.filter(ch => ch.id !== id);
        return this.saveData(data);
    }

    incrementChapterViews(id) {
        const data = this.getData();
        if (!data) return false;

        const chapter = data.chapters.find(ch => ch.id === id);
        if (chapter) {
            chapter.views = (chapter.views || 0) + 1;
            return this.saveData(data);
        }
        return false;
    }

    // Gallery Methods
    getGallery(category = null) {
        const data = this.getData();
        if (!data) return [];
        
        let gallery = data.gallery;
        if (category) {
            gallery = gallery.filter(item => item.category === category);
        }
        return gallery.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }

    addGalleryItem(item) {
        const data = this.getData();
        if (!data) return false;

        const newItem = {
            id: this.generateId(),
            title: item.title,
            imageUrl: item.imageUrl,
            category: item.category || 'character',
            description: item.description || '',
            uploadDate: new Date().toISOString()
        };

        data.gallery.push(newItem);
        return this.saveData(data) ? newItem : null;
    }

    deleteGalleryItem(id) {
        const data = this.getData();
        if (!data) return false;

        data.gallery = data.gallery.filter(item => item.id !== id);
        return this.saveData(data);
    }

    // News Methods
    getNews() {
        const data = this.getData();
        return data ? data.news.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)) : [];
    }

    addNews(news) {
        const data = this.getData();
        if (!data) return false;

        const newNews = {
            id: this.generateId(),
            title: news.title,
            content: news.content,
            publishDate: news.publishDate || new Date().toISOString()
        };

        data.news.push(newNews);
        return this.saveData(data) ? newNews : null;
    }

    deleteNews(id) {
        const data = this.getData();
        if (!data) return false;

        data.news = data.news.filter(item => item.id !== id);
        return this.saveData(data);
    }

    // Utility Methods
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

    // Export/Import for backup
    exportData() {
        const data = this.getData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `void-walker-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.chapters && data.gallery && data.news) {
                return this.saveData(data);
            }
            return false;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete ALL content? This cannot be undone!')) {
            localStorage.removeItem(this.storageKey);
            this.initializeStorage();
            return true;
        }
        return false;
    }
}

// Initialize global content manager
const contentManager = new ContentManager();
