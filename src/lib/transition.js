//@ts-nocheck

import { slide } from 'svelte/transition';
import { cubicInOut } from 'svelte/easing';

export function fadeSlide(node, options) {
    const slideTrans = slide(node, options)
    return {
        duration: options.duration,
        easing: cubicInOut,
        css: t => `
				${slideTrans.css(t)}
				opacity: ${t};
			`
    };
}