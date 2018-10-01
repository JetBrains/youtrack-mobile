/**
 * Author: deanmcpherson
 * Copied from https://github.com/deanmcpherson/react-native-drag-drop
 */

import React from 'react';
import propTypes from 'prop-types';
import {View} from 'react-native';

class DropZone extends React.Component {
  constructor(props) {
    super(props);
    this.displayName = 'DropZone';
    this.state = {};
    this.reportMeasurements = this.reportMeasurements.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  reportMeasurements() {
    if (this.props.dragging)
      this.context.dragContext.removeZone(this.refs.wrapper);
    this.refs.wrapper.measure((_, __, width, height, x, y) => {
      if (!this.props.dragging)
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

  static propTypes = {
    onEnter: propTypes.func,
    onLeave: propTypes.func,
    onDrop: propTypes.func
  };

  componentDidMount() {
    this.reportMeasurements();
    this._timer = setInterval(this.reportMeasurements, 1000);
  }

  componentWillUnmount() {
    this.context.dragContext.removeZone(this.refs.wrapper);
    clearInterval(this._timer);
  }
  componentDidUpdate() {
    this.reportMeasurements();
  }

  onEnter({x, y}) {
    if (this.props.disabled) return;
    if (!this.state.active) {
      if (this.props.onEnter) this.props.onEnter();
      this.setState({
        active: true
      });
    }
  }

  onLeave() {
    if (this.props.disabled) return;
    if (this.state.active) {
      if (this.props.onLeave) this.props.onLeave();
      this.setState({
        active: false
      });
    }
  }

  onDrop(data) {
    if (this.props.disabled) return;
    if (this.props.onDrop) this.props.onDrop(data);
    this.setState({
      active: false
    });
  }

  static contextTypes = {
    dragContext: propTypes.any
  };

  render() {
    return (
      <View
        style={this.props.style}
        pointerEvents={this.props.pointerEvents}
        onLayout={this.reportMeasurements}
        ref="wrapper"
      >
        {React.Children.map(this.props.children, child => {
          return React.cloneElement(
            child,
            Object.assign({}, this.props, {dragOver: this.state.active})
          );
        })}
      </View>
    );
  }
}

export default DropZone;
