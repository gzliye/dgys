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
        this.updateStats();
        this.renderGallery();
    }

    async loadPhotos() {
        try {
            const response = await fetch('../photos.json');
            const data = await response.json();
            this.photos = data.photos;
            this.filteredPhotos = [...this.photos];
        } catch (error) {
            console.error('加载失败:', error);
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterPhotos(e.target.dataset.filter);
            });
        });

        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
        
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('modal').classList.contains('active')) return;
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'ArrowLeft') this.navigatePhoto(-1);
            if (e.key === 'ArrowRight') this.navigatePhoto(1);
        });

        document.getElementById('modal-prev').addEventListener('click', () => this.navigatePhoto(-1));
        document.getElementById('modal-next').addEventListener('click', () => this.navigatePhoto(1));

        let touchStartX = 0;
        document.querySelector('.modal-image-container').addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        document.querySelector('.modal-image-container').addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.navigatePhoto(1);
                else this.navigatePhoto(-1);
            }
        });
    }

    filterPhotos(filter) {
        this.currentFilter = filter;
        this.filteredPhotos = filter === 'all' ? [...this.photos] : this.photos.filter(p => p.region === filter);
        this.renderGallery();
    }

    updateStats() {
        const locations = new Set(this.photos.map(p => p.location).filter(l => l));
        const years = this.photos.map(p => p.year).filter(y => y);
        document.getElementById('total-photos').textContent = this.photos.length;
        document.getElementById('total-locations').textContent = locations.size;
        if (years.length > 0) {
            const minYear = Math.min(...years), maxYear = Math.max(...years);
            document.getElementById('year-range').textContent = minYear === maxYear ? minYear : `${minYear}-${maxYear}`;
        }
    }

    encodePath(path) {
        const parts = path.split('/');
        const filename = parts.pop();
        return parts.join('/') + '/' + encodeURIComponent(filename);
    }

    renderGallery() {
        const gallery = document.getElementById('gallery');
        if (this.filteredPhotos.length === 0) {
            gallery.innerHTML = '<p style="text-align:center;padding:2rem;color:#999;">暂无照片</p>';
            return;
        }
        gallery.innerHTML = this.filteredPhotos.map((photo, index) => `
            <article class="photo-card" data-index="${index}">
                <div class="card-image-wrapper">
                    <img src="${this.encodePath(photo.sources.mobile)}" alt="${photo.title}" loading="lazy">
                    <div class="card-overlay"><p>${photo.location || '未知地点'}</p></div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${photo.title}</h3>
                    <div class="card-meta">
                        ${photo.location ? `<span>📍 ${photo.location}</span>` : ''}
                        ${photo.date ? `<span>📅 ${photo.date}</span>` : ''}
                    </div>
                </div>
            </article>
        `).join('');

        document.querySelectorAll('.photo-card').forEach(card => {
            card.addEventListener('click', () => this.openModal(parseInt(card.dataset.index)));
        });
    }

    openModal(index) {
        this.currentIndex = index;
        const photo = this.filteredPhotos[index];
        
        document.getElementById('modal-title').textContent = photo.title;
        document.getElementById('modal-location').innerHTML = '📍 ' + (photo.location || '未知地点');
        document.getElementById('modal-date').innerHTML = '📅 ' + (photo.date || '未知日期');
        document.getElementById('modal-camera').innerHTML = '📷 ' + (photo.camera || '未知设备');
        document.getElementById('modal-description').textContent = photo.description;
        document.getElementById('modal-comment').textContent = photo.comment;

        document.getElementById('modal-picture').innerHTML = `<img src="${this.encodePath(photo.sources.desktop)}" alt="${photo.title}">`;

        const exif = [
            { label: '相机', value: photo.camera },
            { label: '镜头', value: photo.lens },
            { label: '焦距', value: photo.focal ? `${photo.focal}mm` : null },
            { label: '光圈', value: photo.aperture ? `f/${photo.aperture}` : null },
            { label: 'ISO', value: photo.iso },
            { label: '分辨率', value: photo.width ? `${photo.width}×${photo.height}` : null }
        ].filter(i => i.value);
        document.getElementById('modal-exif').innerHTML = exif.map(i => `<div class="exif-item"><strong>${i.label}:</strong>${i.value}</div>`).join('');

        document.getElementById('modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    navigatePhoto(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.filteredPhotos.length) this.openModal(newIndex);
    }
}

const album = new PhotoAlbum();
