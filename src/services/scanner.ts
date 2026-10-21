/**
 * Barcode Scanner Service (Phase 2C)
 * 
 * Hardware-accelerated barcode detection using window.BarcodeDetector on modern Android/Chrome,
 * with graceful lazy fallback to @zxing/library for cross-platform support.
 */

// Declare BarcodeDetector for TypeScript environments where it is not yet in lib.dom.d.ts
declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export interface ScannerControls {
  stop: () => void;
  switchCamera?: () => Promise<void>;
}

export function isNativeBarcodeDetectorSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

/**
 * Start barcode scanning on a video element.
 * Returns a cleanup function that stops camera tracks and reader loops.
 */
export function startScan(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
  onError?: (err: Error) => void
): () => void {
  let isStopped = false;
  let activeStream: MediaStream | null = null;
  let animFrameId: number | null = null;
  let zxingReader: any = null;

  const handleDetectedCode = (rawCode: string) => {
    if (isStopped) return;
    const cleanCode = rawCode.trim();
    if (cleanCode) {
      onCode(cleanCode);
    }
  };

  const setupCamera = async (): Promise<MediaStream> => {
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    activeStream = stream;
    video.srcObject = stream;
    video.setAttribute('playsinline', 'true'); // Required for iOS Safari
    await video.play();
    return stream;
  };

  const startNativeScanning = async () => {
    try {
      const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'];
      const detector = new window.BarcodeDetector({ formats });

      const scanLoop = async () => {
        if (isStopped) return;

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          try {
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0) {
              const first = barcodes[0];
              if (first.rawValue) {
                handleDetectedCode(first.rawValue);
              }
            }
          } catch {
            // Frame decode error - continue to next frame
          }
        }

        if (!isStopped) {
          animFrameId = requestAnimationFrame(scanLoop);
        }
      };

      animFrameId = requestAnimationFrame(scanLoop);
    } catch (err: any) {
      console.warn('Native BarcodeDetector initialization failed, falling back to ZXing', err);
      startZXingFallback();
    }
  };

  const startZXingFallback = async () => {
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/library');
      if (isStopped) return;

      zxingReader = new BrowserMultiFormatReader();
      // Decode continuously from video element
      zxingReader.decodeFromVideoElement(video, (result: any, err: any) => {
        if (isStopped) return;
        if (result) {
          handleDetectedCode(result.getText());
        }
        if (err && !(err.name === 'NotFoundException')) {
          // Ignored expected frame-not-found errors
        }
      });
    } catch (err: any) {
      console.error('ZXing fallback failed:', err);
      onError?.(err);
    }
  };

  // Launch camera and start appropriate detector
  setupCamera()
    .then(() => {
      if (isStopped) return;
      if (isNativeBarcodeDetectorSupported()) {
        startNativeScanning();
      } else {
        startZXingFallback();
      }
    })
    .catch((err) => {
      console.error('Camera access error:', err);
      onError?.(err);
    });

  // Teardown / cleanup function
  return () => {
    isStopped = true;

    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    if (zxingReader) {
      try {
        zxingReader.reset();
      } catch {}
      zxingReader = null;
    }

    if (activeStream) {
      activeStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      activeStream = null;
    }

    if (video) {
      video.srcObject = null;
    }
  };
}
