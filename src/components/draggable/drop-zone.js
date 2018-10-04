/**
 * Author: deanmcpherson
 * Copied from https://github.com/deanmcpherson/react-native-drag-drop
 */

import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';

class DropZone extends React.Component {
  static contextTypes = {
    dragContext: PropTypes.any
  };

  static propTypes = {
    onEnter: PropTypes.func,
    onLeave: PropTypes.func,
    onDrop: PropTypes.func
  };

  state = {};

  reportMeasurements = () => {
    if (this.props.dragging) {
      this.context.dragContext.removeZone(this.refs.wrapper);
    }

    this.refs.wrapper.measure((_, __, width, height, x, y) => {
      if (this.props.dragging) {
        return;
      }
      this.context.dragContext.updateZone({
        width,
        height,
        x,
        y,
        ref: this.refs.wrapper,
        onEnter: this.onEnter,
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
    this.context.dragContext.removeZone(this.refs.wrapper);
    clearInterval(this._timer);
  }
  componentDidUpdate() {
    this.reportMeasurements();
  }

  onEnter = ({x, y}) => {
    if (this.props.disabled) {
      return;
    }
    if (!this.state.active) {
      if (this.props.onEnter) {
        this.props.onEnter();
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
      this.setState({active: false});
    }
  }

  onDrop = (data) => {
    if (this.props.disabled) {
      return;
    }
    if (this.props.onDrop) {
      this.props.onDrop(data);
    }
    this.setState({active: false});
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
        {React.Children.map(children, child => (
          React.cloneElement(child, {dragOver: this.state.active})
        ))}
      </View>
    );
  }
}

export default DropZone;
