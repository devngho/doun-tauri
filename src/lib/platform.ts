function getOS(): 'macos' | 'windows' | 'linux' | 'unknown' {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
        return 'macos';
    } else if (platform.includes('win')) {
        return 'windows';
    } else if (platform.includes('linux')) {
        return 'linux';
    } else {
        return 'unknown';
    }
}

export const currentOS = getOS();