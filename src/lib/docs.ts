// 加载所有文档目录的 markdown 文件
const docModules = import.meta.glob('/src/content/**/*.md', { eager: true, query: '?raw' });

interface DocModule {
	default: string; // 确保内容作为原始字符串导入
	metadata?: Record<string, unknown>;
}

export interface Doc {
	slug: string;
	path: string;
	metadata: Record<string, unknown>;
	component: unknown;
}

export interface NavItem {
	title: string;
	href: string;
	order?: number;
}

export interface NavSection {
	title: string;
	items: NavItem[];
	order: number;
}

// 基于 README.md 的分类结构定义导航顺序和分组
const DOCS_CATEGORIES: Record<string, { title: string; order: number; prefixes: string[] }> = {
	'getting-started': {
		title: 'Getting Started',
		order: 1,
		prefixes: ['start-']
	},
	'core-concepts': {
		title: 'Core Concepts',
		order: 2,
		prefixes: ['core-', 'control-']
	},
	'native-integration': {
		title: 'Native Integration',
		order: 3,
		prefixes: ['native-']
	},
	navigation: {
		title: 'Navigation',
		order: 4,
		prefixes: ['navigation']
	},
	'client-libraries': {
		title: 'Client Libraries',
		order: 5,
		prefixes: ['client-libraries-', 'advanced-protobuf']
	},
	'standard-library': {
		title: 'Standard Library',
		order: 6,
		prefixes: ['stdlib-', 'glossary']
	},
	advanced: {
		title: 'Advanced Topics',
		order: 7,
		prefixes: ['advanced-']
	},
	performance: {
		title: 'Performance',
		order: 8,
		prefixes: ['performance-']
	},
	workflow: {
		title: 'Workflow',
		order: 9,
		prefixes: ['workflow-', 'command-line']
	},
	misc: {
		title: 'Misc',
		order: 10,
		prefixes: ['third-party', 'faq']
	},
	help: {
		title: 'Help',
		order: 11,
		prefixes: ['help-']
	}
};

const API_SECTIONS: Record<string, { title: string; order: number }> = {
	'api-quick-reference': { title: 'Quick Reference', order: 1 },
	'api-reference-elements': { title: 'Elements', order: 2 },
	'api-style-attributes': { title: 'Style Attributes', order: 3 }
};

const CODELABS_SECTIONS: Record<string, { title: string; order: number }> = {
	getting_started: { title: 'Getting Started', order: 1 },
	advanced_ui: { title: 'Advanced UI', order: 2 },
	integration_with_native: { title: 'Integration with Native', order: 3 },
	shared_business_logic: { title: 'Shared Business Logic', order: 4 }
};

export function getAllDocs(): Doc[] {
	const docs: Doc[] = [];

	for (const [path, module] of Object.entries(docModules)) {
		const mod = module as DocModule;
		const slug = path.replace('/src/content/', '').replace('.md', '');

		docs.push({
			slug,
			path,
			metadata: mod.metadata || {},
			component: mod.default
		});
	}

	return docs;
}

export function getDocBySlug(slug: string): Doc | undefined {
	const docs = getAllDocs();
	return docs.find((doc) => doc.slug === slug);
}

export function getDocsByCategory(category: string): Doc[] {
	const docs = getAllDocs();
	return docs.filter((doc) => doc.slug.startsWith(category + '/'));
}

/**
 * 从文件名提取标题（如果没有 frontmatter title）
 */
function extractTitleFromFilename(filename: string): string {
	// 移除前缀数字和分类前缀
	let title = filename
		.replace(/^\d+-/, '') // 移除开头的数字前缀 "1-", "2-"
		.replace(/^(start|core|native|advanced|performance|workflow|help|stdlib|client-libraries|api)-?/, '')
		.replace(/-/g, ' ')
		.replace(/_/g, ' ');

	// 首字母大写
	return title
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * 从 markdown 内容的第一个 h1 标题提取标题
 */
function extractTitleFromContent(doc: Doc): string {
	const metadata = doc.metadata as { title?: string };
	if (metadata.title) {
		return metadata.title;
	}

	// 从 slug 提取文件名
	const parts = doc.slug.split('/');
	const filename = parts[parts.length - 1];
	return extractTitleFromFilename(filename);
}

/**
 * 生成 API 文档的导航结构
 */
export function getApiNavigation(): NavSection[] {
	const docs = getDocsByCategory('api');
	const items: NavItem[] = [];

	for (const doc of docs) {
		const filename = doc.slug.replace('api/', '');
		const config = API_SECTIONS[filename];

		items.push({
			title: config?.title || extractTitleFromContent(doc),
			href: `/docs/${doc.slug}`,
			order: config?.order || 99
		});
	}

	items.sort((a, b) => (a.order || 99) - (b.order || 99));

	return [
		{
			title: 'API Reference',
			order: 1,
			items
		}
	];
}

/**
 * 生成 Codelabs 的导航结构
 */
export function getCodelabsNavigation(): NavSection[] {
	const docs = getDocsByCategory('codelabs');
	const sections: Map<string, NavItem[]> = new Map();

	for (const doc of docs) {
		const parts = doc.slug.replace('codelabs/', '').split('/');

		if (parts.length >= 2) {
			const sectionKey = parts[0];
			const filename = parts[parts.length - 1];

			if (!sections.has(sectionKey)) {
				sections.set(sectionKey, []);
			}

			// 提取序号用于排序
			const orderMatch = filename.match(/^(\d+)-/);
			const order = orderMatch ? parseInt(orderMatch[1]) : 99;

			sections.get(sectionKey)!.push({
				title: extractTitleFromContent(doc),
				href: `/docs/${doc.slug}`,
				order
			});
		} else {
			// 根目录的文件
			if (!sections.has('general')) {
				sections.set('general', []);
			}
			sections.get('general')!.push({
				title: extractTitleFromContent(doc),
				href: `/docs/${doc.slug}`,
				order: 99
			});
		}
	}

	const result: NavSection[] = [];

	for (const [key, items] of sections) {
		const config = CODELABS_SECTIONS[key];
		items.sort((a, b) => (a.order || 99) - (b.order || 99));

		result.push({
			title: config?.title || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
			order: config?.order || 99,
			items
		});
	}

	result.sort((a, b) => a.order - b.order);
	return result;
}

/**
 * 生成主文档的导航结构
 */
export function getDocsNavigation(): NavSection[] {
	const docs = getDocsByCategory('docs');
	const categorized: Map<string, NavItem[]> = new Map();

	for (const doc of docs) {
		const filename = doc.slug.replace('docs/', '');

		// 找到匹配的分类
		let matchedCategory: string | null = null;
		for (const [catKey, catConfig] of Object.entries(DOCS_CATEGORIES)) {
			if (catConfig.prefixes.some((prefix) => filename.startsWith(prefix))) {
				matchedCategory = catKey;
				break;
			}
		}

		// 排除 protobuf（它在 client-libraries 中处理）
		if (filename === 'advanced-protobuf' && matchedCategory === 'advanced') {
			matchedCategory = 'client-libraries';
		}

		if (!matchedCategory) {
			matchedCategory = 'misc';
		}

		if (!categorized.has(matchedCategory)) {
			categorized.set(matchedCategory, []);
		}

		categorized.get(matchedCategory)!.push({
			title: extractTitleFromContent(doc),
			href: `/docs/${doc.slug}`
		});
	}

	const result: NavSection[] = [];

	for (const [key, items] of categorized) {
		const config = DOCS_CATEGORIES[key];
		// 按标题字母排序
		items.sort((a, b) => a.title.localeCompare(b.title));

		result.push({
			title: config?.title || key,
			order: config?.order || 99,
			items
		});
	}

	result.sort((a, b) => a.order - b.order);
	return result;
}

/**
 * 获取完整的导航结构
 */
export function getFullNavigation(): {
	docs: NavSection[];
	api: NavSection[];
	codelabs: NavSection[];
} {
	return {
		docs: getDocsNavigation(),
		api: getApiNavigation(),
		codelabs: getCodelabsNavigation()
	};
}
