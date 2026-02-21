# 📷 老爸摄影集

一个精美的响应式摄影作品展示网站，可部署到 GitHub Pages。

## 🌟 功能特点

- **响应式设计** - 自适应手机、平板、桌面等各种设备
- **图片优化** - 支持多种尺寸和 WebP 格式，加载更快
- **分类浏览** - 按地区分类筛选照片
- **详情展示** - 包含拍摄参数、描述、点评等信息
- **暗色模式** - 自动适应系统暗色主题
- **键盘导航** - 支持方向键和 ESC 键操作

## 📁 目录结构

```
gh-pages/
├── index.html          # 主页面
├── photos.json         # 照片数据（描述、点评可编辑）
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── app.js          # 交互逻辑
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions 部署配置
```

## ✏️ 编辑照片信息

编辑 `photos.json` 文件来修改照片信息：

```json
{
  "photos": [
    {
      "id": "photo_id",
      "title": "照片标题",
      "description": "照片描述（可编辑）",
      "comment": "摄影点评（可编辑）",
      "tags": ["标签1", "标签2"]
    }
  ]
}
```

### 可编辑字段

| 字段 | 说明 |
|------|------|
| `title` | 照片标题 |
| `description` | 照片描述 |
| `comment` | 摄影点评 |
| `tags` | 标签数组 |

## 🚀 部署到 GitHub Pages

### 方法一：GitHub Actions 自动部署

1. 将整个项目上传到 GitHub 仓库
2. 进入仓库 Settings → Pages
3. Source 选择 "GitHub Actions"
4. 推送代码后自动部署

### 方法二：手动部署

1. 进入仓库 Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 `main`，目录选择 `/gh-pages`
4. 保存后等待部署完成

## 📱 使用说明

### 浏览照片
- 点击分类按钮筛选不同地区的照片
- 点击照片卡片查看详情

### 详情页操作
- 点击左右箭头或使用键盘方向键切换照片
- 按 ESC 键关闭详情页
- 手机端可左右滑动切换照片

## 📊 照片统计

- 总照片数：63 张
- 拍摄地点：多个城市和国家
- 时间跨度：2010-2025年
- 主要相机：NIKON D90 / D800

---

© 2024 老爸摄影集 | 用心记录每一刻
