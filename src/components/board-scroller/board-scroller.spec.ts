import {
  getSnapPoints,
  getClosestSnapPoints,
  getSnapToX,
} from './board-scroller__math';

import type {NativeSyntheticEvent, NativeScrollEvent} from 'react-native';
import type {BoardColumn} from 'types/Agile';

describe('BoardScroller', () => {
  let columns: BoardColumn[];
  beforeEach(() => {
    columns = [
      {collapsed: false},
      {collapsed: false},
      {collapsed: false},
      {collapsed: false},
    ] as BoardColumn[];
  });

  describe('calculating columns starts', () => {
    it('should calculate snap points of open columns', () => {
      const points = getSnapPoints(columns);
      expect(points).toEqual([0, 637.5, 1275, 1912.5]);
    });

    it('should not drop first snap if first column is collapsed', () => {
      columns[0].collapsed = true;
      const points = getSnapPoints(columns);
      expect(points).toEqual([0, 64, 701.5, 1339]);
    });

    it('should adjust if second column is collapsed', () => {
      columns[1].collapsed = true;
      const points = getSnapPoints(columns);
      expect(points).toEqual([0, 701.5, 1339]);
    });
  });

  describe('calculating closest snap points', () => {
    it('should return closest snap points', () => {
      const points = getClosestSnapPoints(140, [0, 100, 200, 300]);
      expect(points).toEqual([100, 200]);
    });

    it('should return zero if scrolled to left outside', () => {
      const points = getClosestSnapPoints(-10, [0, 100, 200, 300]);
      expect(points).toEqual([0, 0]);
    });
  });

  describe('snapping to apropriate point', () => {
    let event: NativeSyntheticEvent<NativeScrollEvent>;
    beforeEach(() => {
      event = {
        nativeEvent: {
          contentOffset: {
            x: 0,
            y: 0,
          },
          velocity: {
            x: 0,
            y: 0,
          },
        },
      } as NativeSyntheticEvent<NativeScrollEvent>;
    });

    it('should snap to zero if speed is small and X is closer to 0 than to next snap', () => {
      event.nativeEvent.contentOffset.x = 100;
      expect(getSnapToX(event, columns)).toBe(28);
    });

    it('should snap to first snap if speed is small and X is closer to next column', () => {
      event.nativeEvent.contentOffset.x = 500;
      expect(getSnapToX(event, columns)).toBe(665.5);
    });

    it('should snap to first snap if speed is enough even if X is closer to zero', () => {
      event.nativeEvent.contentOffset.x = 100;
      event.nativeEvent.velocity!.x = 2;
      expect(getSnapToX(event, columns)).toBe(665.5);
    });

    it('should snap to zero if speed is enough even if X is closer to first column', () => {
      event.nativeEvent.contentOffset.x = 500;
      event.nativeEvent.velocity!.x = -2;
      expect(getSnapToX(event, columns)).toBe(28);
    });

    it('should snap to last column even if moving to next', () => {
      event.nativeEvent.contentOffset.x = 2225;
      event.nativeEvent.velocity!.x = 2;
      expect(getSnapToX(event, columns)).toBe(1940.5);
    });
  });
});
