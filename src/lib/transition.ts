import { slide, type SlideParams, type TransitionConfig } from 'svelte/transition';
import { cubicInOut } from 'svelte/easing';

export function fadeSlide(node: Element, options: SlideParams = {}): TransitionConfig {
    const slideTrans = slide(node, options)
    return {
        // Svelte 5 has no default duration; 300 is what Svelte 4 used
        duration: options.duration ?? 300,
        easing: cubicInOut,
        css: (t, u) => `
				${slideTrans.css?.(t, u)}
				opacity: ${t};
			`
    };
}
