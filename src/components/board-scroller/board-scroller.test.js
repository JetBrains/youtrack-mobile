import {getSnapPoints, getClosestSnapPoints, getSnapToX} from './board-scroller__math';

describe('BoardScroller', () => {
  let columns;

  beforeEach(() => {
    columns = [
      {collapsed: false},
      {collapsed: false},
      {collapsed: false},
      {collapsed: false}
    ];
  });

  describe('calculating columns starts', () => {
    it('should calculate snap points of open columns', () => {
      const points = getSnapPoints(columns);
      points.should.deep.equal([0, 675, 1350, 2025]);
    });

    it('should not drop first snap if first column is collapsed', () => {
      columns[0].collapsed = true;
      const points = getSnapPoints(columns);
      points.should.deep.equal([0, 32, 707, 1382]);
    });

    it('should ajust if second column is collapsed', () => {
      columns[1].collapsed = true;
      const points = getSnapPoints(columns);
      points.should.deep.equal([0, 707, 1382]);
    });
  });

  describe('calculating closest snap points', () => {
    it('should return closest snap points', () => {
      const points = getClosestSnapPoints(140, [0, 100, 200, 300]);
      points.should.deep.equal([100, 200]);
    });

    it('should return zero if scrolled to left outside', () => {
      const points = getClosestSnapPoints(-10, [0, 100, 200, 300]);
      points.should.deep.equal([0, 0]);
    });
  });

  describe('snapping to apropriate point', () => {
    let event;
    beforeEach(() => {
      event = {
        nativeEvent: {
          contentOffset: {x: 0},
          velocity: {x: 0}
        },
      };
    });

    it('should snap to zero if speed is small and X is closer to 0 than to next snap', () => {
      event.nativeEvent.contentOffset.x = 100;
      getSnapToX(event, columns).should.equal(0);
    });

    it('should snap to first snap if speed is small and X is closer to next column', () => {
      event.nativeEvent.contentOffset.x = 500;
      getSnapToX(event, columns).should.equal(675);
    });

    it('should snap to first snap if speed is enough even if X is closer to zero', () => {
      event.nativeEvent.contentOffset.x = 100;
      event.nativeEvent.velocity.x = 2;
      getSnapToX(event, columns).should.equal(675);
    });

    it('should snap to zero if speed is enough even if X is closer to first column', () => {
      event.nativeEvent.contentOffset.x = 500;
      event.nativeEvent.velocity.x = -2;
      getSnapToX(event, columns).should.equal(0);
    });

    it('should snap to last column even if moving to next', () => {
      event.nativeEvent.contentOffset.x = 2225;
      event.nativeEvent.velocity.x = 2;
      getSnapToX(event, columns).should.equal(2025);
    });
  });
});
