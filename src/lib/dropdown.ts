// opens the child dropdown at the cursor on right click
export function contextDropdown(node: HTMLElement) {
    const handler = (e: MouseEvent) => {
        // bubbles: Svelte 5 delegates onclick to the root
        node.querySelector('.dropdown')?.dispatchEvent(new MouseEvent('click', {
            clientX: e.clientX,
            clientY: e.clientY,
            relatedTarget: e.relatedTarget,
            bubbles: true,
        }))
        e.preventDefault()
    }
    node.addEventListener('contextmenu', handler)
    return {
        destroy() {
            node.removeEventListener('contextmenu', handler)
        }
    }
}

export type DropdownContext = { close: () => void }
export const dropdownContext = Symbol('dropdownContext')
