/* @flow */
import React, {Component} from 'react';
import {ScrollView, Dimensions, Platform, UIManager} from 'react-native';
import {AGILE_COLLAPSED_COLUMN_WIDTH} from '../variables/variables';
import {DragContext} from '../draggable/drag-container';

import type {BoardColumn} from '../../flow/Agile';

const MINIMAL_MOMENTUM_SPEED = 0.5;
export const COLUMN_SCREEN_PART = 0.9;
const AUTOSCROLL_GAP = 50;

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

type Props = {
  children: any,
  refreshControl: any,
  horizontalScrollProps: Object,
  columns: ?Array<BoardColumn>,
  snap: boolean,
  dragContext: ?Object
}

type State = {
  size: {
    top: number,
    height: number,
    width: number
  },
  autoScroll: {
    dx: number,
    dy: number
  }
}

class BoardScroller extends Component<Props, State> {
  horizontalScroll: ScrollView;
  verticalScroll: ScrollView;
  state = {layout: {top: 0, width: 0, height: 0}}

  onScrollEndDrag = (event: Object) => {
    const {columns, snap} = this.props;
    if (!columns || !columns?.length || !snap || !this.horizontalScroll) {
      return;
    }

    const GAP_WIDTH = Dimensions.get('window').width * ((1 - COLUMN_SCREEN_PART) / 2);
    const snapX = getSnapToX(event, columns);
    this.horizontalScroll.scrollTo({x: snapX <= AGILE_COLLAPSED_COLUMN_WIDTH ? 0 : (snapX - GAP_WIDTH) });
  };

  horizontalScrollRef = (scrollView: ScrollView) => {
    this.horizontalScroll = scrollView;
  }

  verticalScrollRef = (scrollView: ScrollView) => {
    this.verticalScroll = scrollView;
  }

  onDrag = event => {
    const {width, height, top} = this.state.layout;
    const {x, y: absolyteY} = event;
    const y = absolyteY - top;

    const diffLeft = x - AUTOSCROLL_GAP;
    const diffRight = x - (width - AUTOSCROLL_GAP);
    const dx = diffLeft < 0 ? diffLeft : (diffRight > 0 ? diffRight : 0);


    const diffTop = y - AUTOSCROLL_GAP;
    const diffBottom = y - (height - AUTOSCROLL_GAP);
    const dy = diffTop < 0 ? diffTop : (diffBottom > 0 ? diffBottom : 0);

    this.setState({autoScroll: {dx, dy}});
  }

  componentDidMount() {
    this.props.dragContext.registerOnDrag(this.onDrag);
  }

  onLayout = () => {
    UIManager.measure(this.verticalScroll.getScrollableNode(), (x, y, width, height, pageX, pageY) => {
      this.setState({layout: {top: pageY, width, height}});
    });
  }

  render() {
    const {refreshControl, children, horizontalScrollProps} = this.props;

    return (
      <ScrollView
        refreshControl={refreshControl}
        nestedScrollEnabled
        ref={this.verticalScrollRef}
        onLayout={this.onLayout}
      >
        <ScrollView
          horizontal
          scrollEventThrottle={10}
          decelerationRate="fast"
          ref={this.horizontalScrollRef}
          {...horizontalScrollProps}
          onScrollEndDrag={this.onScrollEndDrag}
        >
          {children}
        </ScrollView>
      </ScrollView>
    );
  }
}

export default props => (
  <DragContext.Consumer>
    {dragContext => <BoardScroller {...props} dragContext={dragContext} />}
  </DragContext.Consumer>
);
