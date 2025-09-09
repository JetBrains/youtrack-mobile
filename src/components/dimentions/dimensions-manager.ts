import {Dimensions} from 'react-native';

export class DimensionsManager {
  private static instance: DimensionsManager;
  private listeners: Set<(width: number) => void> = new Set();
  private currentWidth: number;
  private subscription: any = null;

  private constructor() {
    this.currentWidth = Dimensions.get('window').width;
  }

  static getInstance(): DimensionsManager {
    if (!DimensionsManager.instance) {
      DimensionsManager.instance = new DimensionsManager();
    }
    return DimensionsManager.instance;
  }

  subscribe(callback: (width: number) => void): () => void {
    this.listeners.add(callback);

    if (this.listeners.size === 1 && !this.subscription) {
      this.subscription = Dimensions.addEventListener('change', () => {
        const newWidth = Dimensions.get('window').width;
        if (newWidth !== this.currentWidth) {
          this.currentWidth = newWidth;
          this.listeners.forEach(listener => listener(newWidth));
        }
      });
    }

    return () => {
      this.listeners.delete(callback);

      if (this.listeners.size === 0 && this.subscription) {
        this.subscription?.remove();
        this.subscription = null;
      }
    };
  }

  getCurrentWidth(): number {
    return this.currentWidth;
  }
}
