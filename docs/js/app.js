// 相册应用 - 极简风格
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
        this.updateCounter();
        this.showPhoto(0);
    }

    async loadPhotos() {
        try {
            const response = await fetch('photos.json');
            const data = await response.json();
            this.photos = data.photos;
            this.filteredPhotos = [...this.photos];
        } catch (error) {
            console.error('加载照片数据失败:', error);
        }
    }

    setupEventListeners() {
        // 分类筛选
        document.querySelectorAll('#menu a[data-filter]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('#menu li').forEach(li => li.classList.remove('active'));
                e.target.parentElement.classList.add('active');
                this.filterPhotos(e.target.dataset.filter);
            });
        });

        // Prev/Next 导航
        document.getElementById('prev').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigatePhoto(-1);
        });
        
        document.getElementById('next').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigatePhoto(1);
        });

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigatePhoto(-1);
            if (e.key === 'ArrowRight') this.navigatePhoto(1);
        });

        // 关于弹窗
        document.getElementById('about-link').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('info-overlay').classList.remove('hidden');
        });
        
        document.querySelector('.close-btn').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('info-overlay').classList.add('hidden');
        });
        
        document.getElementById('info-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'info-overlay') {
                e.target.classList.add('hidden');
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
        
        this.currentIndex = 0;
        this.updateCounter();
        this.showPhoto(0);
    }

    encodeImagePath(path) {
        // 分割路径，只编码文件名部分
        const parts = path.split('/');
        const filename = parts.pop();
        const encodedFilename = encodeURIComponent(filename);
        return parts.join('/') + '/' + encodedFilename;
    }

    showPhoto(index) {
        if (this.filteredPhotos.length === 0) return;
        
        const photo = this.filteredPhotos[index];
        const img = document.getElementById('main-img');
        
        // 淡出
        img.classList.add('loading-fade');
        
        setTimeout(() => {
            // 加载新图片 - 使用编码后的路径
            const source = photo.sources.desktop || photo.sources.mobile;
            img.src = this.encodeImagePath(source);
            
            img.onload = () => {
                img.classList.remove('loading-fade');
                img.classList.add('loaded');
            };
            
            img.onerror = () => {
                console.error('图片加载失败:', source);
                // 尝试加载 mobile 版本
                if (photo.sources.mobile) {
                    img.src = this.encodeImagePath(photo.sources.mobile);
                }
            };
        }, 200);

        // 更新信息
        document.getElementById('photo-title-main').textContent = photo.title;
        document.getElementById('photo-location').textContent = photo.location ? '📍 ' + photo.location : '';
        document.getElementById('photo-date').textContent = photo.date ? '📅 ' + photo.date : '';
        document.getElementById('photo-description').textContent = photo.description || '';
        document.getElementById('photo-comment').textContent = photo.comment || '';

        // 更新EXIF
        const exif = [];
        if (photo.camera) exif.push('📷 ' + photo.camera);
        if (photo.focal) exif.push('📏 ' + photo.focal + 'mm');
        if (photo.aperture) exif.push('f/' + photo.aperture);
        if (photo.iso) exif.push('ISO ' + photo.iso);
        document.getElementById('photo-exif').innerHTML = exif.map(e => '<span>' + e + '</span>').join('');
    }

    navigatePhoto(direction) {
        const newIndex = this.currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.filteredPhotos.length) {
            this.currentIndex = newIndex;
            this.updateCounter();
            this.showPhoto(newIndex);
        }
    }

    updateCounter() {
        document.getElementById('current-num').textContent = this.filteredPhotos.length > 0 ? this.currentIndex + 1 : 0;
        document.getElementById('total-photos').textContent = this.filteredPhotos.length;
    }
}

// 初始化
const album = new PhotoAlbum();
