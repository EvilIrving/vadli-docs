import type { PageLoad } from './$types';
import { getDocBySlug } from '$lib/docs';

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug;

	try {
		// 使用预先导入的模块系统
		const doc = getDocBySlug(slug);
		
		if (!doc) {
			return {
				status: 404,
				error: new Error('Document not found')
			};
		}
		
		// 获取内容
		let content = '';
		
		// 如果内容是字符串，直接使用
		if (typeof doc.component === 'string') {
			content = doc.component;
		}
		
		return {
			content,
			metadata: doc.metadata || {}
		};
	} catch (error) {
		console.error('Failed to load document:', error);
		return {
			status: 404,
			error: new Error('Document not found')
		};
	}
};