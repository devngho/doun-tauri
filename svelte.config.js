
/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
	// enforce runes mode for our own code only
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes("node_modules") ? undefined : { runes: true },
	},
};
