class PhotoAlbum {
    constructor() {
        this.photos = [];
        this.filteredPhotos = [];
        this.currentIndex = 0;
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadPhotos();
        this.setupEventListeners();
        this.renderThumbnails();
        this.showPhoto(0);
    }

    async loadPhotos() {
        try {
            const response = await fetch('photos.json');
            const data = await response.json();
            this.photos = data.photos;
            this.filteredPhotos = [...this.photos];
        } catch (error) {
            console.error('加载失败:', error);
        }
    }

    setupEventListeners() {
        // 导航箭头
        document.getElementById('prev-btn').addEventListener('click', () => this.navigate(-1));
        document.getElementById('next-btn').addEventListener('click', () => this.navigate(1));

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
            if (e.key === 'i' || e.key === 'I') this.toggleInfo();
            if (e.key === 'Escape') {
                this.closeInfo();
                this.closeAbout();
            }
        });

        // 左侧导航筛选
        document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-link[data-filter]').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                this.filterPhotos(link.dataset.filter);
            });
        });

        // 详情面板
        document.getElementById('close-panel').addEventListener('click', () => this.closeInfo());

        // 点击主图显示详情
        document.getElementById('main-img').addEventListener('click', () => this.toggleInfo());
        
        // 关于弹窗
        document.getElementById('about-link').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('about-overlay').classList.remove('hidden');
        });
        
        document.getElementById('close-about').addEventListener('click', () => this.closeAbout());
        document.getElementById('about-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'about-overlay') this.closeAbout();
        });
    }

    filterPhotos(filter) {
        this.currentFilter = filter;
        this.filteredPhotos = filter === 'all' 
            ? [...this.photos] 
            : this.photos.filter(p => p.region === filter);
        this.currentIndex = 0;
        this.renderThumbnails();
        this.showPhoto(0);
    }

    encodePath(path) {
        const parts = path.split('/');
        const filename = parts.pop();
        return parts.join('/') + '/' + encodeURIComponent(filename);
    }

    renderThumbnails() {
        const container = document.getElementById('thumb-container');
        container.innerHTML = this.filteredPhotos.map((photo, index) => `
            <div class="thumb-item ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <img src="${this.encodePath(photo.sources.thumbnail)}" alt="${photo.title}" loading="lazy">
            </div>
        `).join('');

        container.querySelectorAll('.thumb-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showPhoto(parseInt(item.dataset.index));
            });
        });
    }

    showPhoto(index) {
        if (this.filteredPhotos.length === 0) return;
        
        this.currentIndex = index;
        const photo = this.filteredPhotos[index];
        const img = document.getElementById('main-img');

        img.classList.add('loading');

        setTimeout(() => {
            img.src = this.encodePath(photo.sources.desktop);
            img.onload = () => {
                img.classList.remove('loading');
            };
        }, 150);

        document.getElementById('photo-title').textContent = photo.title;
        document.getElementById('photo-location').textContent = photo.location || '';
        document.getElementById('photo-date').textContent = photo.date || '';
        document.getElementById('current-num').textContent = index + 1;
        document.getElementById('total-num').textContent = this.filteredPhotos.length;

        document.getElementById('panel-title').textContent = photo.title;
        document.getElementById('panel-description').textContent = photo.description || '';
        document.getElementById('panel-comment').textContent = photo.comment || '';
        
        const exif = [];
        if (photo.camera) exif.push('📷 ' + photo.camera);
        if (photo.lens) exif.push('🔭 ' + photo.lens);
        if (photo.focal) exif.push('📏 ' + photo.focal + 'mm');
        if (photo.aperture) exif.push('f/' + photo.aperture);
        if (photo.iso) exif.push('ISO ' + photo.iso);
        document.getElementById('panel-exif').innerHTML = exif.map(e => '<div>' + e + '</div>').join('');

        document.querySelectorAll('.thumb-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        const thumbItems = document.querySelectorAll('.thumb-item');
        if (thumbItems[index]) {
            thumbItems[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }

    navigate(direction) {
        let newIndex = this.currentIndex + direction;
        if (newIndex < 0) newIndex = this.filteredPhotos.length - 1;
        if (newIndex >= this.filteredPhotos.length) newIndex = 0;
        this.showPhoto(newIndex);
    }

    toggleInfo() {
        document.getElementById('info-panel').classList.toggle('hidden');
    }

    closeInfo() {
        document.getElementById('info-panel').classList.add('hidden');
    }
    
    closeAbout() {
        document.getElementById('about-overlay').classList.add('hidden');
    }
}

const album = new PhotoAlbum();
