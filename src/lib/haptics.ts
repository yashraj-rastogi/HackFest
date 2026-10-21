/**
 * Subtle vibration feedback for physical phone interactions
 */
export function triggerHaptic(durationMs: number = 10): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore errors on devices/browsers where vibrate is restricted
    }
  }
}

export function triggerSuccessHaptic(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([10, 30, 10]);
    } catch {
      // Ignore
    }
  }
}
