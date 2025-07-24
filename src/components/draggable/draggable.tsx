/**
 * Original author: deanmcpherson
 * Modification of https://github.com/deanmcpherson/react-native-drag-drop
 */
import * as React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {DragContext} from './drag-container';
import type {DragContextType} from './drag-container';
const LONG_PRESS_DELAY = 500;
type Props = {
  dragOn?: 'onLongPress' | 'onPressIn';
  disabled: boolean;
  children: React.ReactNode;
  data: String | Record<string, any>;
  style: any;
  activeOpacity?: number;
  onPress: (...args: any[]) => any;
};
type PropsWithContext = Props & {
  dragContext: DragContextType;
};

class Draggable extends React.Component<PropsWithContext, void> {
  wrapper = React.createRef<View>();

  _initiateDrag = () => {
    if (!this.props.disabled) {
      this.props.dragContext.onInitiateDrag(
        this.wrapper.current,
        this.props.children,
        this.props.data,
      );
    }
  };

  render() {
    const {dragOn = 'onLongPress'} = this.props;
    const isDragging = this.props.dragContext?.dragging?.data === this.props.data;
    return (
      <TouchableOpacity
        activeOpacity={this.props.activeOpacity}
        style={this.props.style}
        delayLongPress={LONG_PRESS_DELAY}
        onLongPress={
          dragOn === 'onLongPress' ? this._initiateDrag : undefined
        }
        onPress={this.props.onPress}
        onPressIn={
          dragOn === 'onPressIn' ? this._initiateDrag : undefined
        }
        ref={this.wrapper}
      >
        {React.Children.map(this.props.children, child => {
          return React.cloneElement(child, {
            ghost: isDragging,
          });
        })}
      </TouchableOpacity>
    );
  }
}

export default (props: Props) => (
  <DragContext.Consumer>
    {dragContext => {
      if (!dragContext) {
        throw new Error(
          'Draggable should be rendered inside <DragContainer />',
        );
      }

      return <Draggable {...props} dragContext={dragContext} />;
    }}
  </DragContext.Consumer>
);
