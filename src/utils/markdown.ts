// markdown.ts - Markdown 解析工具 (Geek style)
// 解决特殊语法：> [!Note]、@xxx、<slot/> 等

import MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import hljs from 'highlight.js';

// 语言别名映射
export const langAlias: Record<string, string> = {
  tsx: 'xml',
  ts: 'typescript',
  objc: 'objectivec',
  kotlin: 'java',
  vue: 'xml',
  sh: 'bash',
  shell: 'bash',
};

// 创建 markdown-it 实例
const md: MarkdownIt = new MarkdownIt({
  // 启用 HTML 标签（如 <slot/>）
  html: true,
  // 禁用 linkify（防止 @xxx 被解析为链接）
  linkify: false,
  // 代码高亮
  highlight: function (str: string, lang: string): string {
    const realLang = langAlias[lang] || lang;
    if (realLang && hljs.getLanguage(realLang)) {
      try {
        return `<pre class="hljs"><code class="language-${lang}">${
          hljs.highlight(str, { language: realLang }).value
        }</code></pre>`;
      } catch {
        // Fallback to escaped HTML
      }
    }
    return `<pre class="hljs"><code class="language-${lang}">${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

// 注册 > [!Note] > [!Warning] > [!Tip] 支持
['Note', 'Warning', 'Tip'].forEach(type => {
  md.use(container, type.toLowerCase(), {
    validate: function (params: string): boolean {
      return params.trim().match(new RegExp(`^${type}s*(?:\\s+(.*))?$`)) !== null;
    },
    render: function (_env: unknown, _lang: string, _attrs: string): string {
      return `<div class="alert alert-${type.toLowerCase()}">\n`;
    }
  });
});

// 解析 markdown 为 HTML
// 移除第一个 h1 标题（避免与页面标题重复）
export function parseMarkdown(content: string): string {
  // 移除第一个 # 标题
  const trimmed = content.replace(/^#\s+.+\n+/, '');
  return md.render(trimmed);
}

export { md };
