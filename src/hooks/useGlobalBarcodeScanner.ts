import { useEffect, useRef } from 'react';

interface UseGlobalBarcodeScannerOptions {
  onScan: (scannedCode: string) => void;
  minChars?: number;
  maxIntervalMs?: number;
}

export function playScannerBeep(frequency = 900, duration = 0.1) {
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Audio context may be restricted before user gesture
    console.debug('Scanner audio beep suppressed:', err);
  }
}

export function useGlobalBarcodeScanner({
  onScan,
  minChars = 3,
  maxIntervalMs = 70
}: UseGlobalBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Ignore modifiers
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
        return;
      }

      // If user presses Enter, check if buffer looks like a barcode gun input
      if (e.key === 'Enter') {
        const currentCode = bufferRef.current.trim();
        bufferRef.current = '';

        if (currentCode.length >= minChars) {
          playScannerBeep(980, 0.12);
          onScan(currentCode);
        }
        return;
      }

      // If interval between keystrokes was too long, reset buffer (it was human typing, not a hardware scanner)
      if (timeDiff > maxIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      // Only accumulate printable single characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, minChars, maxIntervalMs]);
}
