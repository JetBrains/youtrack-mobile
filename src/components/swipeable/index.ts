export enum swipeDirection {
  left = 'left',
  right = 'right',
}

export type SwipeDirection = keyof typeof swipeDirection;

export interface BaseSwipeableProps {
  enabled?: boolean;
}

export interface ActionColor {
  color?: string;
  backgroundColor?: string;
}
