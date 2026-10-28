// Files saved from the playground and opened in it

/** [name] as a file name with [extension]: kept when it already ends with it, or with one of [accepted] */
export function fileName(name: string, extension: string, accepted: readonly string[] = []): string {
    const base = name.trim().replace(/[\\/:*?"<>|]+/g, '_') || 'theory';
    const known = [extension, ...accepted].some(it => base.toLowerCase().endsWith(`.${it}`));
    return known ? base : `${base}.${extension}`;
}

/** Saves [text] as the file [name] */
export function downloadText(name: string, text: string): void {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    downloadUrl(name, url);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Saves what [url] holds (a data URL, say) as the file [name] */
export function downloadUrl(name: string, url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
}

/** Asks for a file of [accept] and gives its name and text, or null when none is picked */
export function pickFile(accept: string): Promise<{ name: string; text: string } | null> {
    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (file === undefined) return resolve(null);
            file.text().then(
                text => resolve({ name: file.name, text }),
                () => resolve(null),
            );
        });
        input.addEventListener('cancel', () => resolve(null));
        input.click();
    });
}
