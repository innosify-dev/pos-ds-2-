import { storeProfile } from './settings.data.js';

const STORAGE_KEY = 'takshi-working-hours';

export function parseClock(value) {
  const [hours, minutes] = String(value ?? '').split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function readWorkingHours() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    const opening = parseClock(stored?.openingTime);
    const closing = parseClock(stored?.closingTime);
    if (opening != null && closing != null && closing - opening >= 60) {
      return { openingTime: stored.openingTime, closingTime: stored.closingTime };
    }
  } catch {
    /* fall through to the store profile */
  }
  return {
    openingTime: storeProfile.openingTime,
    closingTime: storeProfile.closingTime,
  };
}

export function saveWorkingHours(hours) {
  const opening = parseClock(hours.openingTime);
  const closing = parseClock(hours.closingTime);
  if (opening == null || closing == null || closing - opening < 60) return false;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ openingTime: hours.openingTime, closingTime: hours.closingTime }),
  );
  window.dispatchEvent(new CustomEvent('takshi-working-hours'));
  return true;
}
