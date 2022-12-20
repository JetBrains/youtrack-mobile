import type {Node} from 'react';
import React, {Component} from 'react';
import {Dimensions, ScrollView, UIManager} from 'react-native';
import debounce from 'lodash.debounce';
import {
  clamp,
  getPointShift,
  getSnapToX,
  COLUMN_VIEWPORT_WIDTH_FACTOR,
} from './board-scroller__math';
import type {DragContextType} from '../draggable/drag-container';
import {DragContext} from '../draggable/drag-container';
import {AGILE_COLLAPSED_COLUMN_WIDTH} from '../agile-common/agile-common';
import type {BoardColumn} from 'flow/Agile';
type Props = {
  children: any;
  refreshControl: any;
  horizontalScrollProps: Record<string, any>;
  verticalScrollProps: Record<string, any>;
  columns: Array<BoardColumn> | null | undefined;
  snap: boolean;
  dragContext: DragContextType;
  boardHeader: React.ReactElement<React.ComponentProps<any>, any>;
  sprintSelector: React.ReactElement<React.ComponentProps<any>, any>;
  agileSelector: React.ReactElement<React.ComponentProps<any>, any>;
  boardSearch: React.ReactElement<React.ComponentProps<any>, any>;
};
type UnamangedState = {
  layout: {
    top: number;
    height: number;
    width: number;
  };
  autoScroll: {
    dx: number;
    dy: number;
    active: boolean;
  };
  scrollPositions: {
    offsetX: number;
    maxX: number;
    offsetY: number;
    maxY: number;
  };
};
type State = {
  isDragging: boolean;
};

class BoardScroller extends Component<Props, State> {
  horizontalScroll: ScrollView;
  verticalScroll: ScrollView;
  state: State = {
    isDragging: false,
  };
  // This state is not intended to affect render function
  unmanagedState: UnamangedState = {
    layout: {
      top: 0,
      width: 0,
      height: 0,
    },
    autoScroll: {
      dx: 0,
      dy: 0,
      active: false,
    },
    scrollPositions: {
      offsetX: 0,
      maxX: 10000,
      offsetY: 0,
      maxY: 10000,
    },
  };
  reportZonesMeasurements = debounce(() => {
    this.props.dragContext.dropZones.forEach(zone => zone.reportMeasurements());
  }, 100);

  componentDidMount() {
    if (this.props.dragContext) {
      this.props.dragContext.registerOnDragStart(() => {
        this.setState({
          isDragging: true,
        });
      });
      this.props.dragContext.registerOnDrag(this.onDrag);
      this.props.dragContext.registerOnDrop(() => {
        this.unmanagedState.autoScroll.active = false;
        this.setState({
          isDragging: false,
        });
      });
    }
  }

  onScrollEndDrag = (event: Record<string, any>) => {
    const {columns, snap} = this.props;

    if (!columns || !columns?.length || !snap || !this.horizontalScroll) {
      return;
    }

    const GAP_WIDTH =
      Dimensions.get('window').width * ((1 - COLUMN_VIEWPORT_WIDTH_FACTOR) / 2);
    const snapX = getSnapToX(event, columns);

    if (typeof snapX === 'number' && typeof GAP_WIDTH === 'number') {
      this.horizontalScroll.scrollTo({
        x: snapX <= AGILE_COLLAPSED_COLUMN_WIDTH ? 0 : snapX - GAP_WIDTH,
      });
    }
  };
  onDrag = (data: {
    point: {
      x: number;
      y: number;
    };
    width: number;
    height: number;
  }) => {
    const isScrolling = this.unmanagedState.autoScroll.active;
    const {dx, dy} = getPointShift(data, this.unmanagedState.layout);
    this.unmanagedState.autoScroll = {
      dx,
      dy,
      active: dx !== 0 || dy !== 0,
    };

    if (!isScrolling && this.unmanagedState.autoScroll.active) {
      this.performAutoScroll();
    }
  };
  performAutoScroll = () => {
    const SPEED_DIVIDE = 10;
    const {dx, dy, active} = this.unmanagedState.autoScroll;

    if (!active) {
      return;
    }

    const {offsetX, maxX, offsetY, maxY} = this.unmanagedState.scrollPositions;
    const newX = dx === 0 ? null : clamp(offsetX + dx / SPEED_DIVIDE, 0, maxX);
    const newY = dy === 0 ? null : clamp(offsetY + dy / SPEED_DIVIDE, 0, maxY);

    if (newX !== null && typeof newX === 'number') {
      this.horizontalScroll &&
        this.horizontalScroll.scrollTo({
          x: newX,
          animated: false,
        });
      this.unmanagedState.scrollPositions.offsetX = newX || offsetX;
    }

    if (newY !== null && typeof newY === 'number') {
      this.verticalScroll &&
        this.verticalScroll.scrollTo({
          y: newY,
          animated: false,
        });
      this.unmanagedState.scrollPositions.offsetY = newY || offsetY;
    }

    requestAnimationFrame(this.performAutoScroll);
  };
  onVerticalScroll = event => {
    if (this.props.verticalScrollProps?.onScroll) {
      this.props.verticalScrollProps.onScroll(event);
    }

    const {nativeEvent} = event;
    const viewHeight = nativeEvent.layoutMeasurement.height;
    this.unmanagedState.scrollPositions.offsetY = nativeEvent.contentOffset.y;
    this.unmanagedState.scrollPositions.maxY =
      nativeEvent.contentSize.height - viewHeight;
    this.reportZonesMeasurements();
  };
  onHorizontalScroll = event => {
    if (this.props.horizontalScrollProps?.onScroll) {
      this.props.horizontalScrollProps.onScroll(event);
    }

    const {nativeEvent} = event;
    const viewWidth = nativeEvent.layoutMeasurement.width;
    this.unmanagedState.scrollPositions.offsetX = nativeEvent.contentOffset.x;
    this.unmanagedState.scrollPositions.maxX =
      nativeEvent.contentSize.width - viewWidth;
    this.reportZonesMeasurements();
  };
  onLayout = () => {
    UIManager.measure(
      this.verticalScroll.getScrollableNode(),
      (x, y, width, height, pageX, pageY) => {
        this.unmanagedState.layout = {
          top: pageY,
          width,
          height,
        };
      },
    );
  };
  horizontalScrollRef = (scrollView: ScrollView | null | undefined) => {
    this.horizontalScroll = scrollView ? scrollView : this.horizontalScroll;
  };
  verticalScrollRef = (scrollView: ScrollView | null | undefined) => {
    this.verticalScroll = scrollView ? scrollView : this.verticalScroll;
  };

  render() {
    const {
      refreshControl,
      children,
      horizontalScrollProps,
      verticalScrollProps,
      boardHeader,
      agileSelector,
      sprintSelector,
      boardSearch,
    } = this.props;
    const {isDragging} = this.state;
    return (
      <ScrollView
        refreshControl={refreshControl}
        nestedScrollEnabled
        ref={this.verticalScrollRef}
        {...verticalScrollProps}
        onScroll={this.onVerticalScroll}
        scrollEventThrottle={10}
        onLayout={this.onLayout}
        scrollEnabled={!isDragging}
        stickyHeaderIndices={[0, sprintSelector ? 3 : 2]}
      >
        {agileSelector}
        {sprintSelector}
        {boardSearch}
        {boardHeader}

        <ScrollView
          horizontal // scrollEventThrottle={10}
          decelerationRate="fast"
          ref={this.horizontalScrollRef}
          {...horizontalScrollProps}
          onScroll={this.onHorizontalScroll}
          onScrollEndDrag={this.onScrollEndDrag}
          scrollEnabled={!isDragging}
        >
          {children}
        </ScrollView>
      </ScrollView>
    );
  }
}

export default (props: Record<string, any>): Node => (
  <DragContext.Consumer>
    {dragContext => <BoardScroller {...props} dragContext={dragContext} />}
  </DragContext.Consumer>
);