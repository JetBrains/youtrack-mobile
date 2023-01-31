import {Dimensions} from 'react-native';
import {
  AGILE_COLLAPSED_COLUMN_WIDTH,
  AGILE_TABLET_EXPANDED_COLUMN_WIDTH,
} from '../agile-common/agile-common';
import {UNIT} from 'components/variables';
import {isIOSPlatform} from 'util/util';
import {isAllColumnsCollapsed} from 'views/agile-board/agile-board__helper';
import type {BoardColumn} from 'types/Agile';
type WidthData = {
  windowWidth: number;
  cardWidth: number;
};
export const COLUMN_VIEWPORT_WIDTH_FACTOR = 0.85;
const MINIMAL_MOMENTUM_SPEED = 0.5;
const AUTOSCROLL_GAP = 5;
const LEFT_BOARD_SPACE: number = UNIT * 3.5;

function calculateWidthData(): WidthData {
  const windowWidth = Dimensions.get('window').width;
  return {
    windowWidth,
    cardWidth: windowWidth * COLUMN_VIEWPORT_WIDTH_FACTOR,
  };
}

/**
 * Limits value to desired range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
export function getColumnsWidthAsArray(
  columns: BoardColumn[] = [],
): number[] {
  const widthData: WidthData = calculateWidthData();
  return columns.map(col =>
    col.collapsed ? AGILE_COLLAPSED_COLUMN_WIDTH : widthData.cardWidth,
  );
}
export function getScrollableWidth(
  columns: BoardColumn[] = [],
  isSplitView: boolean,
): number {
  const widthData: WidthData = calculateWidthData();

  if (isAllColumnsCollapsed(columns)) {
    return widthData.windowWidth;
  }

  if (isSplitView) {
    return Math.max(
      columns.reduce((totalWidth, column: BoardColumn) => {
        if (column.collapsed) {
          totalWidth += AGILE_COLLAPSED_COLUMN_WIDTH;
        } else {
          totalWidth += AGILE_TABLET_EXPANDED_COLUMN_WIDTH;
        }

        return totalWidth;
      }, 0),
      widthData.windowWidth,
    );
  }

  return getColumnsWidthAsArray(columns).reduce(
    (totalWidth: number, item: number) => totalWidth + item,
    0,
  );
}
export function getSnapPoints(columns: BoardColumn[]): number[] {
  const widthData = calculateWidthData();
  return columns
    .map(c => c.collapsed)
    .map(collapsed => {
      return {
        collapsed,
        width: collapsed ? AGILE_COLLAPSED_COLUMN_WIDTH : widthData.cardWidth,
      };
    })
    .reduce((acc, {collapsed, width}, index) => {
      const prev = acc[index - 1] || null;
      return [
        ...acc,
        {
          width,
          collapsed,
          start: prev?.start + prev?.width || 0,
        },
      ];
    }, [])
    .filter(item => !item.collapsed || item.start === 0)
    .map(item => item.start);
}
export function getClosestSnapPoints(
  x: number,
  openColumnStarts: number[],
): number[] {
  const prev = openColumnStarts.filter(it => it < x).pop() || 0;
  const next = openColumnStarts.filter(it => it > x).shift();
  return [
    prev,
    next > x ? next : openColumnStarts[openColumnStarts.length - 1],
  ];
}
export function getSnapToX(
  scrollEvent: Record<string, any>,
  columns: BoardColumn[],
): number {
  const openColumnStarts = getSnapPoints(columns);
  const x = scrollEvent.nativeEvent.contentOffset.x;
  const [prev, next] = getClosestSnapPoints(x, openColumnStarts);
  let xSpeed = scrollEvent.nativeEvent.velocity.x;
  xSpeed = isIOSPlatform() ? xSpeed : -xSpeed; // On android xSpeed is inverted by unknown reason

  const snapToLeft =
    Math.abs(xSpeed) < MINIMAL_MOMENTUM_SPEED
      ? x - prev < next - x
      : xSpeed < 0;
  return snapToLeft ? prev + LEFT_BOARD_SPACE : next + LEFT_BOARD_SPACE;
}

/**
 * Calculates card edges position shift relative to scroll-sensitive borders
 */
export function getPointShift(
  dragData: {
    point: {
      x: number;
      y: number;
    };
    width: number;
    height: number;
  },
  layout: {
    width: number;
    height: number;
    top: number;
  },
): {
  dx: number;
  dy: number;
} {
  const {x, y: absolyteY} = dragData.point;
  const {width, height, top} = layout;
  const y = absolyteY - top;
  const diffLeft = x - AUTOSCROLL_GAP;
  const diffRight = x + dragData.width * 0.6 - (width - AUTOSCROLL_GAP);
  const dx = diffLeft < 0 ? diffLeft : diffRight > 0 ? diffRight : 0;
  const diffTop = y - AUTOSCROLL_GAP;
  const diffBottom = y + dragData.height - (height - AUTOSCROLL_GAP);
  const dy = diffTop < 0 ? diffTop : diffBottom > 0 ? diffBottom : 0;
  return {
    dx,
    dy,
  };
}
