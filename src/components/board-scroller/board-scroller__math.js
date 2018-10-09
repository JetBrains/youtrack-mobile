/* @flow */
import {Dimensions, Platform} from 'react-native';
import {AGILE_COLLAPSED_COLUMN_WIDTH} from '../variables/variables';

import type {BoardColumn} from '../../flow/Agile';

const MINIMAL_MOMENTUM_SPEED = 0.5;
export const COLUMN_SCREEN_PART = 0.9;
const AUTOSCROLL_GAP = 5;

/**
 * Limits value to desired range
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getSnapPoints(columns: Array<BoardColumn>): Array<number> {
  const COLUMN_WIDTH = Dimensions.get('window').width * COLUMN_SCREEN_PART;

  return columns
    .map(c => c.collapsed)
    .map(collapsed => ({collapsed, width: collapsed ? AGILE_COLLAPSED_COLUMN_WIDTH : COLUMN_WIDTH}))
    .reduce((acc, {collapsed, width}, index) => {
      const prev = acc[index - 1] || null;
      return [
        ...acc,
        {
          width,
          collapsed,
          start: (prev?.start + prev?.width) || 0
        }
      ];
    }, [])
    .filter(item => !item.collapsed || item.start === 0)
    .map(item => item.start);
}

export function getClosestSnapPoints(x: number, openColumnStarts: Array<number>) {
  const prev = openColumnStarts.filter(it => it < x).pop() || 0;
  const next = openColumnStarts.filter(it => it > x).shift();
  return [prev, next > x ? next : openColumnStarts[openColumnStarts.length - 1]];
}

export function getSnapToX(scrollEvent: Object, columns: Array<BoardColumn>) {
  const openColumnStarts = getSnapPoints(columns);
  const x = scrollEvent.nativeEvent.contentOffset.x;
  const [prev, next] = getClosestSnapPoints(x, openColumnStarts);

  let xSpeed = scrollEvent.nativeEvent.velocity.x;
  xSpeed = Platform.OS === 'ios' ? xSpeed : -xSpeed; // On android xSpeed is inverted by unknown reason
  const snapToLeft = Math.abs(xSpeed) < MINIMAL_MOMENTUM_SPEED ? (x - prev < next - x) : xSpeed < 0;
  return snapToLeft ? prev : next;
}

/**
 * Calculates card edges position shift relative to scroll-sensitive borders
 */
export function getPointShift(
  dragData: {point: {x: number, y: number}, width: number, height: number},
  layout: {width: number, height: number, top: number}
): {dx: number, dy: number} {
  const {x, y: absolyteY} = dragData.point;
  const {width, height, top} = layout;
  const y = absolyteY - top;

  const diffLeft = x - AUTOSCROLL_GAP;
  const diffRight = (x + dragData.width * 0.6) - (width - AUTOSCROLL_GAP);
  const dx = diffLeft < 0 ? diffLeft : (diffRight > 0 ? diffRight : 0);

  const diffTop = y - AUTOSCROLL_GAP;
  const diffBottom = (y + dragData.height) - (height - AUTOSCROLL_GAP);
  const dy = diffTop < 0 ? diffTop : (diffBottom > 0 ? diffBottom : 0);

  return {dx, dy};
}
