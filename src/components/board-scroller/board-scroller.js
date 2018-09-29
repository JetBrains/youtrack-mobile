/* @flow */
import React, {Component} from 'react';
import {ScrollView, Dimensions, Platform} from 'react-native';
import {AGILE_COLLAPSED_COLUMN_WIDTH} from '../variables/variables';

import type {BoardColumn} from '../../flow/Agile';

const MINIMAL_MOMENTUM_SPEED = 0.5;
export const COLUMN_SCREEN_PART = 0.9;

type Props = {
  children: any,
  refreshControl: any,
  horizontalScrollProps: Object,
  columns: ?Array<BoardColumn>,
  snap: boolean
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
  let prev = 0;
  let next = 0;
  for (const cursor of openColumnStarts) {
    if (cursor < x) {
      prev = cursor;
    } else {
      next = cursor;
      break;
    }
  }
  if (next < prev) {
    next = prev;
  }
  return [prev, next];
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

export default class BoardScroller extends Component<Props, void> {
  horizontalScroll: ScrollView;

  onScrollEndDrag = (event: Object) => {
    const {columns, snap} = this.props;
    if (!columns || !columns?.length || !snap || !this.horizontalScroll) {
      return;
    }

    const GAP_WIDTH = Dimensions.get('window').width * ((1 - COLUMN_SCREEN_PART) / 2);
    const snapX = getSnapToX(event, columns);
    this.horizontalScroll.scrollTo({x: snapX <= 0 ? 0 : (snapX - GAP_WIDTH) });
  };

  horizontalScrollRef = (node: ScrollView) => {
    this.horizontalScroll = node;
  }

  render() {
    const {refreshControl, children, horizontalScrollProps} = this.props;

    return (
      <ScrollView
        refreshControl={refreshControl}
        nestedScrollEnabled
      >
        <ScrollView
          horizontal
          scrollEventThrottle={30}
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
