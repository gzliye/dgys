// 相册应用
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
        this.hideLoading();
    }

    async loadPhotos() {
        try {
            const response = await fetch('photos.json');
            const data = await response.json();
            this.photos = data.photos;
            this.filteredPhotos = [...this.photos];
            this.albumInfo = data.album;
            this.categories = data.categories;
        } catch (error) {
            console.error('加载照片数据失败:', error);
            document.getElementById('gallery').innerHTML = 
                '<p style="text-align:center;padding:2rem;color:var(--accent-color);">加载失败，请刷新页面重试</p>';
        }
    }

    setupEventListeners() {
        // 导航筛选
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterPhotos(e.target.dataset.filter);
            });
        });

        // 弹窗关闭
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('modal').classList.contains('active')) return;
            
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'ArrowLeft') this.navigatePhoto(-1);
            if (e.key === 'ArrowRight') this.navigatePhoto(1);
        });

        // 弹窗导航按钮
        document.getElementById('modal-prev').addEventListener('click', () => this.navigatePhoto(-1));
        document.getElementById('modal-next').addEventListener('click', () => this.navigatePhoto(1));

        // 触摸滑动支持
        let touchStartX = 0;
        const modalImage = document.querySelector('.modal-image-container');
        
        modalImage.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        modalImage.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.navigatePhoto(1);
                else this.navigatePhoto(-1);
            }
        });
    }

    filterPhotos(filter) {
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.filteredPhotos = [...this.photos];
        } else {
            this.filteredPhotos = this.photos.filter(p => p.region === filter);
        }
        
        this.renderGallery();
    }

    updateStats() {
        const locations = new Set(this.photos.map(p => p.location).filter(l => l));
        const years = this.photos.map(p => p.year).filter(y => y);
        
        document.getElementById('total-photos').textContent = this.photos.length;
        document.getElementById('total-locations').textContent = locations.size;
        
        if (years.length > 0) {
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            document.getElementById('year-range').textContent = 
                minYear === maxYear ? minYear : `${minYear}-${maxYear}`;
        }
    }

    renderGallery() {
        const gallery = document.getElementById('gallery');
        
        if (this.filteredPhotos.length === 0) {
            gallery.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-secondary);">暂无照片</p>';
            return;
        }

        gallery.innerHTML = this.filteredPhotos.map((photo, index) => `
            <article class="photo-card" data-index="${index}" onclick="album.openModal(${index})">
                <div class="card-image-wrapper">
                    <picture>
                        <source srcset="../${photo.sources.webp}" type="image/webp">
                        <source srcset="../${photo.sources.tablet}" media="(min-width: 768px)">
                        <img src="../${photo.sources.mobile}" 
                             alt="${photo.title}" 
                             loading="lazy"
                             width="400"
                             height="267">
                    </picture>
                    <div class="card-overlay">
                        <p>${photo.location || '未知地点'}</p>
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${photo.title}</h3>
                    <div class="card-meta">
                        ${photo.location ? `<span>📍 ${photo.location}</span>` : ''}
                        ${photo.date ? `<span>📅 ${photo.date}</span>` : ''}
                    </div>
                    <p class="card-description">${photo.description}</p>
                </div>
            </article>
        `).join('');
    }

    openModal(index) {
        this.currentIndex = index;
        const photo = this.filteredPhotos[index];
        
        // 更新弹窗内容
        document.getElementById('modal-title').textContent = photo.title;
        document.getElementById('modal-location').innerHTML = `📍 ${photo.location || '未知地点'}`;
        document.getElementById('modal-date').innerHTML = `📅 ${photo.date || '未知日期'}`;
        document.getElementById('modal-camera').innerHTML = `📷 ${photo.camera || '未知设备'}`;
        document.getElementById('modal-description').textContent = photo.description;
        document.getElementById('modal-comment').textContent = photo.comment;

        // 更新图片
        const picture = document.getElementById('modal-picture');
        picture.innerHTML = `
            <source srcset="../${photo.sources.webp}" type="image/webp">
            <source srcset="../${photo.sources.desktop}" media="(min-width: 1200px)">
            <source srcset="../${photo.sources.tablet}" media="(min-width: 768px)">
            <img src="../${photo.sources.mobile}" alt="${photo.title}">
        `;

        // 更新EXIF信息
        const exifGrid = document.getElementById('modal-exif');
        const exifData = [
            { label: '相机', value: photo.camera },
            { label: '镜头', value: photo.lens },
            { label: '焦距', value: photo.focal ? `${photo.focal}mm` : null },
            { label: '光圈', value: photo.aperture ? `f/${photo.aperture}` : null },
            { label: 'ISO', value: photo.iso },
            { label: '分辨率', value: photo.width ? `${photo.width}×${photo.height}` : null }
        ].filter(item => item.value);

        exifGrid.innerHTML = exifData.map(item => 
            `<div class="exif-item"><strong>${item.label}:</strong>${item.value}</div>`
        ).join('');

        // 显示弹窗
        document.getElementById('modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    navigatePhoto(direction) {
        const newIndex = this.currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.filteredPhotos.length) {
            this.openModal(newIndex);
        }
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
}

// 初始化应用
const album = new PhotoAlbum();
