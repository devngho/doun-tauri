export function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }).join("")
}

export function hexToRgb(hex: string): number[] {
    const red = parseInt(hex.substring(1, 3), 16)
    const green = parseInt(hex.substring(3, 5), 16)
    const blue = parseInt(hex.substring(5, 7), 16)
    return [red, green, blue]
}

export function rgbToHSL(hex: string) {
    let [r, g, b] = hexToRgb(hex);
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
        : 0;
    return [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2,
    ];
  }