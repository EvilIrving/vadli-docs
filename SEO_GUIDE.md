# SEO 优化配置说明

## 已实施的 SEO 优化

### 1. 基础 Meta 标签优化 ✅

**文件**: `index.html`

- 设置了正确的 HTML lang 属性
- 添加了完整的 meta 标签：
  - Primary Meta Tags (title, description, keywords, author)
  - Open Graph / Facebook 标签
  - Twitter Card 标签
  - robots、language、theme-color 等附加标签

### 2. 动态页面 Meta 信息 ✅

**实现文件**:
- `src/utils/seo.ts` - SEO 工具函数
- `src/composables/useSeo.ts` - Vue composable
- `src/views/DocPage.vue` - 文档页面 SEO
- `src/views/HomePage.vue` - 首页 SEO

**功能**:
- 自动从 Markdown 内容提取标题
- 为每个文档页面生成独特的 title、description 和 keywords
- 自动更新 canonical URL
- 404 和 500 页面使用 `noindex, nofollow`

### 3. 结构化数据 (JSON-LD) ✅

每个页面自动添加：
- **Breadcrumb** 结构化数据（面包屑导航）
- **TechArticle** 结构化数据（技术文章）

这有助于 Google 更好地理解页面内容和结构。

### 4. 站点地图 (sitemap.xml) ✅

**文件**: `scripts/generate-sitemap.ts`

**功能**:
- 自动扫描所有 Markdown 文档
- 根据内容类型设置优先级：
  - 首页：1.0
  - Getting Started 页面：0.9
  - API Reference 页面：0.8
  - Code Labs 页面：0.8
  - 其他文档页面：0.7
- 设置 changefreq 为 weekly
- 在构建前自动生成

**使用命令**:
```bash
# 手动生成站点地图
pnpm generate:sitemap

# 构建时自动生成（已配置 prebuild hook）
pnpm build
```

### 5. robots.txt ✅

**文件**: `public/robots.txt`

配置：
- 允许所有爬虫访问
- 指向站点地图
- 设置 crawl-delay 为 1 秒

## 如何使用

### 在新页面中添加 SEO

#### 方式 1: 使用 useSeo composable（推荐）

```vue
<script setup lang="ts">
import { useSeo } from '@/composables/useSeo'
import { computed } from 'vue'

// 静态 SEO
useSeo({
  title: 'My Page Title | Valdi Documentation',
  description: 'Page description for SEO',
  canonical: 'https://valdi.dev/my-page'
})

// 或者动态 SEO
const seoMeta = computed(() => ({
  title: dynamicTitle.value,
  description: dynamicDescription.value,
  canonical: `https://valdi.dev${route.path}`
}))

useSeo(seoMeta)
</script>
```

#### 方式 2: 直接使用工具函数

```typescript
import { updateMetaTags, addStructuredData } from '@/utils/seo'

// 更新 meta 标签
updateMetaTags({
  title: 'My Title',
  description: 'My Description',
  keywords: 'keyword1, keyword2',
  canonical: 'https://valdi.dev/page'
})

// 添加结构化数据
addStructuredData({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'My Article Title'
})
```

### 为文档页面生成 SEO

```typescript
import { generateDocSeo } from '@/utils/seo'

const seoMeta = generateDocSeo(
  'docs',                    // category
  'core-components',         // slug
  'Core Components',         // title
  markdownContent           // content (optional)
)

useSeo(seoMeta)
```

## 配置选项

### 修改站点 URL

在以下文件中修改 `SITE_URL`:
- `src/utils/seo.ts`
- `scripts/generate-sitemap.ts`
- `index.html` (meta 标签中的 URL)

### 修改默认 SEO 设置

编辑 `src/utils/seo.ts` 中的 `DEFAULT_SEO` 对象：

```typescript
const DEFAULT_SEO: SeoMetaData = {
  title: 'Your Site Title',
  description: 'Your site description',
  keywords: 'your, keywords',
  // ...
}
```

### 修改 Open Graph 图片

1. 将 OG 图片放到 `public/og-image.png`
2. 更新 `index.html` 和 `src/utils/seo.ts` 中的图片 URL

## SEO 最佳实践

### 1. Title 标签
- 保持在 50-60 个字符
- 包含主要关键词
- 使用独特且描述性的标题

### 2. Description 标签
- 保持在 150-160 个字符
- 包含目标关键词
- 写成吸引人的摘要

### 3. Keywords
- 包含 5-10 个相关关键词
- 不要堆砌关键词

### 4. Canonical URL
- 始终设置 canonical URL
- 避免重复内容问题

### 5. 结构化数据
- 使用相关的 schema.org 类型
- 提供完整且准确的信息

## 验证 SEO

### 检查工具

1. **Google Search Console**
   - 提交站点地图
   - 检查索引状态
   - 查看搜索性能

2. **Google Rich Results Test**
   - 测试结构化数据
   - URL: https://search.google.com/test/rich-results

3. **PageSpeed Insights**
   - 检查页面性能
   - URL: https://pagespeed.web.dev/

4. **Meta Tags Checker**
   - 验证 meta 标签
   - URL: https://metatags.io/

### 本地验证

```bash
# 构建并预览
pnpm build
pnpm preview

# 检查生成的文件
cat public/sitemap.xml
cat public/robots.txt

# 在浏览器中检查
# 1. 打开开发者工具
# 2. 查看 <head> 中的 meta 标签
# 3. 在 Console 中查看结构化数据：
#    document.querySelector('script[type="application/ld+json"]').textContent
```

## 性能优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 添加 alt 属性
   - 使用适当的尺寸

2. **代码分割**
   - 已通过 Vite 自动实现
   - 路由级别的代码分割

3. **缓存策略**
   - 在部署时配置 CDN 缓存
   - 设置适当的 Cache-Control headers

4. **预渲染/SSR**
   - 考虑使用 Vite SSR 或静态站点生成
   - 提高首次加载性能和 SEO

## 部署后检查清单

- [ ] 在 Google Search Console 中提交站点地图
- [ ] 验证 robots.txt 可访问
- [ ] 检查所有页面的 meta 标签
- [ ] 验证结构化数据
- [ ] 测试社交媒体分享（Twitter, Facebook）
- [ ] 检查移动端友好性
- [ ] 运行 PageSpeed Insights
- [ ] 设置 Google Analytics（如需要）
- [ ] 设置监控和追踪

## 持续优化

1. **定期更新内容** - 保持文档最新
2. **监控搜索性能** - 使用 Google Search Console
3. **分析用户行为** - 使用 Analytics
4. **获取反馈** - 从用户处收集改进建议
5. **A/B 测试** - 测试不同的 title 和 description

## 相关资源

- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
