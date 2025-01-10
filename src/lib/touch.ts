export function getXY(e: MouseEvent | TouchEvent) {
    if (e instanceof MouseEvent) return [e.clientX, e.clientY]
    else {
        const touch = e.touches[0] ?? e.targetTouches[0] ?? e.changedTouches[0]
        return [touch.clientX, touch.clientY]
    }
}

export function getMiddleY(box: { top: number, bottom: number }) {
    return (box.top + box.bottom) / 2
}