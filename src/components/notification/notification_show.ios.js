const DURATION = 10000;

export default function showNotification (message, errorMessage, toastComponent, duration = DURATION) {
  const details = errorMessage ? `: ${errorMessage}` : '';
  return toastComponent.show(`${message}${details}`, duration);
}
