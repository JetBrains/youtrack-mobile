/**
 * Author: deanmcpherson
 * Copied from https://github.com/deanmcpherson/react-native-drag-drop
 */

import React from 'react';
import PropTypes from 'prop-types';
import {View, LayoutAnimation} from 'react-native';
import {AGILE_CARD_HEIGHT} from '../agile-card/agile-card';
import { COLOR_PINK } from '../variables/variables';
import Draggable from './draggable';
import {DragContext} from './drag-container';

class DropZone extends React.Component {
  static propTypes = {
    onMoveOver: PropTypes.func,
    onLeave: PropTypes.func,
    onDrop: PropTypes.func,
    dragContext: PropTypes.object
  };

  state = {
    placeholderIndex: null
  };

  reportMeasurements = () => {
    const {dragContext, dragging} = this.props;

    if (dragging) {
      dragContext.removeZone(this.refs.wrapper);
    }

    this.refs.wrapper.measure((_, __, width, height, x, y) => {
      if (dragging) {
        return;
      }
      dragContext.updateZone({
        width,
        height,
        x,
        y,
        ref: this.refs.wrapper,
        onMoveOver: this.onMoveOver,
        onLeave: this.onLeave,
        onDrop: this.onDrop
      });
    });
  }

  componentDidMount() {
    this.reportMeasurements();
    // this._timer = setInterval(this.reportMeasurements, 1000);
  }

  componentWillUnmount() {
    this.props.dragContext.removeZone(this.refs.wrapper);
    clearInterval(this._timer);
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

  onDrop = (data) => {
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
    if (placeholderIndex === null) {
      return children;
    }
    const childs = React.Children.toArray(children);
    const withoutMoving = childs.filter(c => this.props.dragContext?.dragging?.data !== c.props.data);

    withoutMoving.splice(placeholderIndex, 0, (
      <View key="placeholder" style={{height: 8, backgroundColor: COLOR_PINK}}></View>
    ));
    return withoutMoving;
  }

  render() {
    const {style, pointerEvents, children} = this.props;

    return (
      <View
        style={style}
        pointerEvents={pointerEvents}
        onLayout={this.reportMeasurements}
        ref="wrapper"
      >
        {this.getChildrenWithPlaceholder(children)}
      </View>
    );
  }
}

export default props => (
  <DragContext.Consumer>
  {dragContext => <DropZone {...props} dragContext={dragContext} />}
</DragContext.Consumer>
);
