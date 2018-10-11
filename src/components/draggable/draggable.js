/* @flow */
/**
 * Original author: deanmcpherson
 * Modification of https://github.com/deanmcpherson/react-native-drag-drop
 */
import React, {Component} from 'react';
import {TouchableOpacity} from 'react-native';
import {DragContext} from './drag-container';

import type {DragContextType} from './drag-container';

type Props = {
  dragOn: 'onLongPress' | 'onPressIn',
  dragContext: DragContextType,
  disabled: boolean,
  children: any,
  data: any,
  style: any,
  activeOpacity: number,
  onPress: Function
};

class Draggable extends Component<Props, void> {
  _initiateDrag = () => {
    if (!this.props.disabled)
      this.props.dragContext.onInitiateDrag(
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

export default (props: Object) => (
  <DragContext.Consumer>
    {dragContext => <Draggable {...props} dragContext={dragContext} />}
  </DragContext.Consumer>
);

