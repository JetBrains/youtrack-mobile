/* @flow */
import React, {Component} from 'react';
import throttle from 'lodash.throttle';
import {ScrollView, Dimensions, UIManager} from 'react-native';
import {AGILE_COLLAPSED_COLUMN_WIDTH} from '../variables/variables';
import {DragContext} from '../draggable/drag-container';
import {clamp, getSnapToX, getPointShift} from './board-scroller__math';

import type {BoardColumn} from '../../flow/Agile';
import type {DragContextType} from '../draggable/drag-container';

export const COLUMN_SCREEN_PART = 0.9;

type Props = {
  children: any,
  refreshControl: any,
  horizontalScrollProps: Object,
  verticalScrollProps: Object,
  columns: ?Array<BoardColumn>,
  snap: boolean,
  dragContext: DragContextType
}

type UnamangedState = {
  layout: {top: number, height: number, width: number},
  autoScroll: {dx: number, dy: number, active: boolean},
  scrollPositions: {offsetX: number, maxX: number, offsetY: number, maxY: number}
}

type State = {isDragging: boolean};

class BoardScroller extends Component<Props, State> {
  horizontalScroll: ScrollView;
  verticalScroll: ScrollView;
  state: State = {isDragging: false};

  // This state is not intended to affect render function
  unmanagedState: UnamangedState = {
    layout: {top: 0, width: 0, height: 0},
    autoScroll: {dx: 0, dy: 0, active: false},
    scrollPositions: {offsetX: 0, maxX: 10000, offsetY: 0, maxY: 10000}
  }

  componentDidMount() {
    if (this.props.dragContext) {
      this.props.dragContext.registerOnDragStart(() => {
        this.setState({isDragging: true});
      });
      this.props.dragContext.registerOnDrag(this.onDrag);
      this.props.dragContext.registerOnDrop(() => {
        this.unmanagedState.autoScroll.active = false;
        this.setState({isDragging: false});
      });
    }
  }

  onScrollEndDrag = (event: Object) => {
    const {columns, snap} = this.props;
    if (!columns || !columns?.length || !snap || !this.horizontalScroll) {
      return;
    }

    const GAP_WIDTH = Dimensions.get('window').width * ((1 - COLUMN_SCREEN_PART) / 2);
    const snapX = getSnapToX(event, columns);
    this.horizontalScroll.scrollTo({x: snapX <= AGILE_COLLAPSED_COLUMN_WIDTH ? 0 : (snapX - GAP_WIDTH) });
  };

  onDrag = (data: {point: {x: number, y: number}, width: number, height: number}) => {
    const isScrolling = this.unmanagedState.autoScroll.active;
    const {dx, dy} = getPointShift(data, this.unmanagedState.layout);
    this.unmanagedState.autoScroll = {dx, dy, active: dx !== 0 || dy !== 0};
    if (!isScrolling && this.unmanagedState.autoScroll.active) {
      this.performAutoScroll();
    }
  }

  performAutoScroll = () => {
    const SPEED_DIVIDE = 30;
    const {dx, dy, active} = this.unmanagedState.autoScroll;
    if (!active) {
      return;
    }
    const {offsetX, maxX, offsetY, maxY} = this.unmanagedState.scrollPositions;

    const newX = dx === 0 ? null : clamp(offsetX + dx/SPEED_DIVIDE, 0, maxX);
    const newY = dy === 0 ? null : clamp(offsetY + dy/SPEED_DIVIDE, 0, maxY);

    if (newX !== null) {
      this.horizontalScroll.scrollTo({x: newX, animated: false});
      this.unmanagedState.scrollPositions.offsetX = newX || offsetX;
    }
    if (newY !== null) {
      this.verticalScroll.scrollTo({y: newY, animated: false});
      this.unmanagedState.scrollPositions.offsetY = newY || offsetY;
    }

    requestAnimationFrame(this.performAutoScroll);
  }

  reportZonesMeasurements = throttle(() => {
    this.props.dragContext.dropZones.forEach(zone => zone.reportMeasurements());
  }, 100);


  onVerticalScroll = event => {
    if (this.props.verticalScrollProps?.onScroll) {
      this.props.verticalScrollProps.onScroll(event);
    }

    const {nativeEvent} = event;
    const viewHeight = nativeEvent.layoutMeasurement.height;

    this.unmanagedState.scrollPositions.offsetY = nativeEvent.contentOffset.y;
    this.unmanagedState.scrollPositions.maxY = nativeEvent.contentSize.height - viewHeight;

    this.reportZonesMeasurements();
  }

  onHorizontalScroll = event => {
    if (this.props.horizontalScrollProps?.onScroll) {
      this.props.horizontalScrollProps.onScroll(event);
    }

    const {nativeEvent} = event;
    const viewWidth = nativeEvent.layoutMeasurement.width;

    this.unmanagedState.scrollPositions.offsetX = nativeEvent.contentOffset.x;
    this.unmanagedState.scrollPositions.maxX = nativeEvent.contentSize.width - viewWidth;

    this.reportZonesMeasurements();
  }

  onLayout = (event) => {
    UIManager.measure(this.verticalScroll.getScrollableNode(), (x, y, width, height, pageX, pageY) => {
      this.unmanagedState.layout = {top: pageY, width, height};
    });
  }

  horizontalScrollRef = (scrollView: ?ScrollView) => {
    this.horizontalScroll = scrollView ? scrollView : this.horizontalScroll;
  }

  verticalScrollRef = (scrollView: ?ScrollView) => {
    this.verticalScroll = scrollView ? scrollView : this.verticalScroll;
  }

  render() {
    const {refreshControl, children, horizontalScrollProps, verticalScrollProps} = this.props;
    const {isDragging} = this.state;

    return (
      <ScrollView
        refreshControl={refreshControl}
        nestedScrollEnabled
        ref={this.verticalScrollRef}
        {...verticalScrollProps}
        onScroll={this.onVerticalScroll}
        scrollEventThrottle={50}
        onLayout={this.onLayout}
        scrollEnabled={!isDragging}
      >
        <ScrollView
          horizontal
          scrollEventThrottle={10}
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

export default (props: Object) => (
  <DragContext.Consumer>
    {dragContext => <BoardScroller {...props} dragContext={dragContext} />}
  </DragContext.Consumer>
);
