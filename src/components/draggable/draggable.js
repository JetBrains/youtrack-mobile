/**
 * Author: deanmcpherson
 * Copied from https://github.com/deanmcpherson/react-native-drag-drop
 */
import React from 'react';
import propTypes from 'prop-types';
import {TouchableOpacity} from 'react-native';
import {DragContext} from './drag-container';

class Draggable extends React.Component {
  constructor(props) {
    super(props);
    this.displayName = 'Draggable';
    this._initiateDrag = this._initiateDrag.bind(this);
  }

  static propTypes = {
    dragOn: propTypes.oneOf(['onLongPress', 'onPressIn']),
    dragContext: propTypes.object
  };

  _initiateDrag() {
    if (!this.props.disabled)
      this.props.dragContext.onDrag(
        this.refs.wrapper,
        this.props.children,
        this.props.data
      );
  }

  static defaultProps = {
    dragOn: 'onLongPress'
  };

  render() {
    const isDragging = this.props.dragContext?.dragging?.data === this.props.data;
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

export default props => (
  <DragContext.Consumer>
    {dragContext => <Draggable {...props} dragContext={dragContext} />}
  </DragContext.Consumer>
);

