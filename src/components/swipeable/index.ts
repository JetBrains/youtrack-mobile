export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

export interface SwipeAction {
  text?: string;
  icon?: React.ReactNode;
  onSwipe: () => void;
  actionColor?: ActionColor;
}

export interface BaseSwipeableProps {
  enabled?: boolean;
}

export interface ActionColor {
  color?: string;
  backgroundColor?: string;
}

export const hapticConfig = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: true,
} as const;

export const SWIPE_ANIMATION_CONFIG = {
  toEdge: {
    duration: 100,
    useNativeDriver: true,
  },
  fromEdge: {
    duration: 100,
    useNativeDriver: true,
  },
  immediate: {
    duration: 200,
    useNativeDriver: true,
  },
  fallback: {
    duration: 350,
    useNativeDriver: true,
  },
  fallbackSmooth: {
    tension: 120,
    friction: 25,
    useNativeDriver: true,
  },
} as const;

export const PanGestureActiveOffsetX = [-10, 10] as [number, number];

export const PanGestureFailOffsetY = [-20, 20] as [number, number];
