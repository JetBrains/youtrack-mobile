export const Orientation = Object.freeze({
  PORTRAIT: 'portrait',
  PORTRAIT_UPSIDE_DOWN: 'portrait-upside-down',
  LANDSCAPE: 'landscape',
  LANDSCAPE_LEFT: 'landscape-left',
  LANDSCAPE_RIGHT: 'landscape-right'
});

export const AnimationType = Object.freeze({
  NONE: 'none',
  SLIDE: 'slide',
  FADE: 'fade'
});

export type ModalOrientation = $Values<typeof Orientation>

export type ModalAnimationType = $Values<typeof AnimationType>
