import { error } from '@sveltejs/kit';
import { dev } from '$app/env';

// Visual QA page for design tokens: only reachable on the dev server.
export const load = () => {
	if (!dev) error(404);
};
