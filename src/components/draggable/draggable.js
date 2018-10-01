/**
 * Author: deanmcpherson
 * Copied from https://github.com/deanmcpherson/react-native-drag-drop
 */
import React from 'react';
import propTypes from 'prop-types';
import {TouchableOpacity} from 'react-native';

class Draggable extends React.Component {
  constructor(props) {
    super(props);
    this.displayName = 'Draggable';
    this._initiateDrag = this._initiateDrag.bind(this);
  }

  static contextTypes = {
    dragContext: propTypes.any
  };

  static propTypes = {
    dragOn: propTypes.oneOf(['onLongPress', 'onPressIn'])
  };

  _initiateDrag() {
    if (!this.props.disabled)
      this.context.dragContext.onDrag(
        this.refs.wrapper,
        this.props.children,
        this.props.data
      );
  }

  static defaultProps = {
    dragOn: 'onLongPress'
  };

  render() {
    let isDragging = this.context.dragContext?.dragging?.ref;
    isDragging = isDragging && isDragging === this.refs.wrapper;
    return (
      <TouchableOpacity
        activeOpacity={this.props.activeOpacity}
        style={this.props.style}
        onLongPress={
          this.props.dragOn === 'onLongPress' ? this._initiateDrag : null
        }
        onPress={this.props.onPress}
        onPressIn={
          this.props.dragOn === 'onPressIn' ? this._initiateDrag : null
        }
        ref="wrapper"
      >
        {React.Children.map(this.props.children, child => {
          return React.cloneElement(child, {ghost: isDragging});
        })}
      </TouchableOpacity>
    );
  }
}

export default Draggable;
