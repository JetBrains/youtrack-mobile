/* @flow */
/**
 * Original author: deanmcpherson
 * Modification of https://github.com/deanmcpherson/react-native-drag-drop
 */
import * as React from 'react';
import {TouchableOpacity} from 'react-native';
import {DragContext} from './drag-container';

import type {DragContextType} from './drag-container';

const LONG_PRESS_DELAY = 500;

type Props = {
  dragOn: 'onLongPress' | 'onPressIn',
  disabled: boolean,
  children: React.Node,
  data: String | Object,
  style: any,
  activeOpacity: number,
  onPress: Function
};

type PropsWithContext = Props & {dragContext: DragContextType};

class Draggable extends React.Component<PropsWithContext, void> {
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
        delayLongPress={LONG_PRESS_DELAY}
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

export default (props: Props): React.Node => (
  <DragContext.Consumer>
    {dragContext => {
      if (!dragContext) {
        throw new Error('Draggable should be rendered inside <DragContainer />');
      }
      return <Draggable {...props} dragContext={dragContext} />;
    }}
  </DragContext.Consumer>
);

