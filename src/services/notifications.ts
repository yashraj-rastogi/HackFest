import type { Item, Lang } from '../db/schema';
import { formatQty } from '../domain/units';
import { getSetting, setSetting } from '../db/repos';
import { triggerHaptic } from '../lib/haptics';

/**
 * Checks if browser push notifications are supported.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission status.
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user and persist setting.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    await setSetting('notificationsEnabled', granted);
    return granted;
  } catch {
    return false;
  }
}

/**
 * Update the native PWA App Badge count (if supported by Android Chrome / desktop PWA).
 */
export function updateAppBadge(count: number): void {
  if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
    try {
      if (count > 0) {
        (navigator as any).setAppBadge(count).catch(() => {});
      } else {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    } catch {
      // Ignore unsupported browsers
    }
  }
}

/**
 * Synthesizes a crisp, polite double-beep sound for urgent out-of-stock / low-stock events.
 * 100% offline, zero audio asset files needed.
 */
export function playStockAlertBeep(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (480Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(480, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Second tone (660Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now + 0.14);
    gain2.gain.setValueAtTime(0.2, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.3);
  } catch {
    // Ignore environments where Web Audio is restricted
  }
}

/**
 * Display a native browser notification via ServiceWorker or Notification API.
 */
export async function showStockNotification(
  title: string,
  body: string,
  tag: string = 'muneemji-alert'
): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  const enabled = await getSetting<boolean>('notificationsEnabled', true);
  if (!enabled) return;

  const options: any = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag,
    renotify: true,
    data: { url: '/lists' },
  };

  // Try service worker registration first (optimal for mobile Android PWA)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return;
      }
    } catch {
      // Fall through to standard Notification
    }
  }

  // Fallback to standard window Notification
  try {
    new Notification(title, options);
  } catch {
    // Ignore notification instantiation errors
  }
}

/**
 * Triggers low stock or stock out alert notification + haptic + audio.
 */
export async function notifyLowOrOutOfStock(
  item: Item,
  remainingQty: number,
  lang: Lang = 'hi'
): Promise<void> {
  const isOutOfStock = remainingQty <= 0;
  const isLow = remainingQty <= item.minQty;

  if (!isOutOfStock && !isLow) return;

  // Sound + haptic alert
  playStockAlertBeep();
  triggerHaptic(50);

  const localizedName = item.names[lang] || item.names.hi || item.names.en;
  const formattedQty = formatQty(Math.max(0, remainingQty), item.baseUnit, lang);

  let title = '';
  let body = '';

  if (isOutOfStock) {
    if (lang === 'hi') {
      title = `⚠️ ${localizedName} खत्म हो गया!`;
      body = `स्टॉक 0 हो गया है। सप्लायर लिस्ट में री-ऑर्डर करें।`;
    } else if (lang === 'hinglish') {
      title = `⚠️ ${localizedName} khatam ho gaya!`;
      body = `Stock 0 ho gaya hai. Reorder list check karein.`;
    } else {
      title = `⚠️ ${localizedName} is Out of Stock!`;
      body = `Stock reached 0. Check your reorder list.`;
    }
  } else {
    if (lang === 'hi') {
      title = `⚠️ ${localizedName} कम हो रहा है!`;
      body = `सिर्फ ${formattedQty} बचा है। सप्लायर को आर्डर भेजें।`;
    } else if (lang === 'hinglish') {
      title = `⚠️ ${localizedName} kam ho raha hai!`;
      body = `Sirf ${formattedQty} bacha hai. Order list check karein.`;
    } else {
      title = `⚠️ ${localizedName} is Running Low!`;
      body = `Only ${formattedQty} remaining in stock. Reorder soon.`;
    }
  }

  await showStockNotification(title, body, `stock-alert-${item.id}`);
}

/**
 * Test notification trigger for Settings screen.
 */
export async function sendTestNotification(lang: Lang = 'hi'): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  let permission = Notification.permission;
  if (permission !== 'granted') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') return false;

  playStockAlertBeep();
  triggerHaptic(30);

  let title = '🔔 मुनीमजी अलर्ट तैयार है!';
  let body = 'सामान खत्म होने या कम होने पर आपको तुरंत सूचना मिलेगी।';

  if (lang === 'hinglish') {
    title = '🔔 MuneemJi Alerts Ready!';
    body = 'Item khatam ya kam hone par turant notification milega.';
  } else if (lang === 'en') {
    title = '🔔 MuneemJi Notifications Active!';
    body = 'You will receive instant alerts when items run low or go out of stock.';
  }

  await showStockNotification(title, body, 'muneemji-test');
  return true;
}
