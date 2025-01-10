export function contextDropdown(node: HTMLElement) {
    const handler = (e: MouseEvent) => {
        const dropdown = node.querySelector('.dropdown') as HTMLElement | null
        if (dropdown) {
            const virtualEvent = new MouseEvent('click', {
                clientX: e.clientX,
                clientY: e.clientY,
                relatedTarget: e.relatedTarget,
            })
            dropdown.dispatchEvent(virtualEvent)
        }
        e.preventDefault()
    }
    node.addEventListener('contextmenu', handler)
    return {
        destroy() {
            node.removeEventListener('contextmenu', handler)
        }
    }
}

export const dropdownContext = Symbol('dropdownContext')