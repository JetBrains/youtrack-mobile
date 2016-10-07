const DURATION = 10000;

export default function showNotification (message, errorMessage, toastComponent) {
  return toastComponent.show(`${message}: ${errorMessage}`, DURATION);
}
