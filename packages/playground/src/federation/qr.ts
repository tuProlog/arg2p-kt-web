import { renderSVG } from 'uqr';

// QR codes of the links of a pairing: drawn as SVG, and read from the camera (the BarcodeDetector of the browser where
// there is one, jsQR, loaded then, elsewhere)

/** [text] as a QR code, an SVG image with dark modules on white, whatever the theme: cameras read those */
export function qrSvg(text: string): string {
    return renderSVG(text, { ecc: 'M', border: 2, whiteColor: '#ffffff', blackColor: '#000000' });
}

interface Detector {
    detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}

// A reader of the QR codes in frames of video: the browser's, or jsQR on the pixels of a canvas
async function reader(): Promise<(video: HTMLVideoElement) => Promise<string | null>> {
    const native = (globalThis as { BarcodeDetector?: { new (options: { formats: string[] }): Detector; getSupportedFormats(): Promise<string[]> } })
        .BarcodeDetector;
    if (native !== undefined && (await native.getSupportedFormats().catch((): string[] => [])).includes('qr_code')) {
        const detector = new native({ formats: ['qr_code'] });
        return async video => (await detector.detect(video).catch(() => []))[0]?.rawValue ?? null;
    }
    const { default: jsQR } = await import('jsqr');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    return async video => {
        if (video.videoWidth === 0) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        return jsQR(pixels.data, pixels.width, pixels.height)?.data ?? null;
    };
}

/**
 * Shows the camera (the one at the back, on a phone) in [video], and gives [found] the first QR code it reads. Gives
 * what stops it; fails if there is no camera, or the user refuses it.
 */
export async function scanQr(video: HTMLVideoElement, found: (text: string) => void): Promise<() => void> {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    let stopped = false;
    const stop = () => {
        stopped = true;
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    };
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    video.muted = true;
    await video.play();
    const read = await reader();
    const next = async () => {
        if (stopped) return;
        const text = await read(video);
        if (stopped) return;
        if (text !== null) {
            stop();
            found(text);
            return;
        }
        setTimeout(next, 150);
    };
    void next();
    return stop;
}
