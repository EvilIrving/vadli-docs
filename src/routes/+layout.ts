import { getFullNavigation, type NavSection } from '$lib/docs';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
	const navigation = getFullNavigation();

	return {
		navigation
	};
};

export type NavigationData = {
	docs: NavSection[];
	api: NavSection[];
	codelabs: NavSection[];
};
