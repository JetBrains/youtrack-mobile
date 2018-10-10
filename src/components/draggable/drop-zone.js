/* @flow */
/**
 * Original author: deanmcpherson
 * Modification of https://github.com/deanmcpherson/react-native-drag-drop
 */

import React, {Component} from 'react';
import {View, LayoutAnimation} from 'react-native';
import {AGILE_CARD_HEIGHT} from '../agile-card/agile-card';
import { COLOR_PINK } from '../variables/variables';
import Draggable from './draggable';
import {DragContext} from './drag-container';

export type ZoneInfo = {
  width: number,
  height: number,
  x: number,
  y: number,
  data: Object,
  placeholderIndex: ?number,
  ref: Object,
  onMoveOver: ({x: number, y: number}, zone: ZoneInfo) => any,
  onLeave: any => any,
  onDrop: (data: ?Object) => any
}

type Props = {
  onMoveOver: any => any,
  onLeave: any => any,
  onDrop: (data: ?Object) => any,
  data: Object,
  dragContext: Object,
  dragging?: boolean,
  disabled?: boolean,
  children: any,
  style: any
}

type State = {
  placeholderIndex: ?number,
  active: boolean
}

class DropZone extends Component<Props, State> {
  state = {
    placeholderIndex: null,
    active: false
  };

  reportMeasurements = () => {
    const {dragContext, dragging, data} = this.props;

    if (dragging) {
      dragContext.removeZone(this.refs.wrapper);
    }

    this.refs.wrapper.measure((_, __, width, height, x, y) => {
      if (dragging) {
        return;
      }
      const zoneInfo: ZoneInfo = {
        width,
        height,
        x,
        y,
        data,
        placeholderIndex: this.state.placeholderIndex,
        ref: this.refs.wrapper,
        onMoveOver: this.onMoveOver,
        onLeave: this.onLeave,
        onDrop: this.onDrop
      };
      dragContext.updateZone(zoneInfo);
    });
  }

  componentDidMount() {
    this.reportMeasurements();
  }

  componentWillUnmount() {
    this.props.dragContext.removeZone(this.refs.wrapper);
  }

  componentDidUpdate() {
    this.reportMeasurements();
  }

  onMoveOver = ({x, y}, zone) => {
    if (this.props.disabled) {
      return;
    }

    const relativeY = y - zone.y;
    let placeholderIndex = Math.floor(relativeY / AGILE_CARD_HEIGHT);

    const draggableChilds = React.Children.toArray(this.props.children)
      .filter(c => c.type === Draggable)
      .filter(c => this.props.dragContext?.dragging?.data !== c.props.data);

    if (placeholderIndex >= draggableChilds.length) {
      placeholderIndex = draggableChilds.length;
    }

    if (placeholderIndex !== this.state.placeholderIndex) {
      LayoutAnimation.configureNext({duration: 100, update: {type: 'easeInEaseOut'}});
    }
    this.setState({placeholderIndex});

    if (!this.state.active) {
      if (this.props.onMoveOver) {
        this.props.onMoveOver();
      }
      this.setState({active: true});
    }
  }

  onLeave = () => {
    if (this.props.disabled) {
      return;
    }
    if (this.state.active) {
      if (this.props.onLeave) {
        this.props.onLeave();
      }
      this.setState({active: false, placeholderIndex: null});
    }
  }

  onDrop = (data: ?Object) => {
    if (this.props.disabled) {
      return;
    }
    if (this.props.onDrop) {
      this.props.onDrop(data);
    }
    this.setState({active: false, placeholderIndex: null});
  }

  getChildrenWithPlaceholder(children) {
    const {placeholderIndex} = this.state;
    if (placeholderIndex === null || placeholderIndex == undefined) {
      return children;
    }
    const childs = React.Children.toArray(children);
    const withoutMoving = childs.filter((c: Object) => this.props.dragContext?.dragging?.data !== c.props.data);

    withoutMoving.splice(placeholderIndex, 0, (
      <View key="placeholder" style={{height: 8, backgroundColor: COLOR_PINK}}></View>
    ));
    return withoutMoving;
  }

  render() {
    const {style, children} = this.props;

    return (
      <View
        style={style}
        onLayout={this.reportMeasurements}
        ref="wrapper"
      >
        {this.getChildrenWithPlaceholder(children)}
      </View>
    );
  }
}

export default (props: any) => (
  <DragContext.Consumer>
    {dragContext => <DropZone {...props} dragContext={dragContext} />}
  </DragContext.Consumer>
);
