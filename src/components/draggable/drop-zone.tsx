/**
 * Original author: deanmcpherson
 * Modification of https://github.com/deanmcpherson/react-native-drag-drop
 */
import * as React from 'react';
import {View, LayoutAnimation} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Draggable from './draggable';
import {DragContext} from './drag-container';
import {getAgileCardHeight} from '../agile-card/agile-card';
import {UNIT} from 'components/variables';
import type {DragContextType} from './drag-container';
import type {ViewStyleProp} from 'types/Internal';
type ZoneInfoData = {
  columnId: string;
  cellId: string;
  issueIds: string[];
  columnsLength: number;
};
export type ZoneInfo = {
  width: number;
  height: number;
  x: number;
  y: number;
  data: ZoneInfoData;
  placeholderIndex: number | null | undefined;
  ref: React.Ref<typeof DropZone>;
  onMoveOver: (
    arg0: {
      x: number;
      y: number;
    },
    zone: ZoneInfo,
  ) => any;
  onLeave: (arg0: any) => any;
  onDrop: (data: Record<string, any> | null | undefined) => any;
  reportMeasurements: (arg0: any) => any;
};
type Props = {
  onMoveOver: (arg0: any) => any;
  onLeave: (arg0: any) => any;
  onDrop: (data: Record<string, any> | null | undefined) => any;
  data: ZoneInfoData;
  dragging?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  style: any;
};
type PropsWithContext = Props & {
  dragContext: DragContextType;
};
type State = {
  placeholderIndex: number | null | undefined;
  active: boolean;
};

class DropZone extends React.Component<PropsWithContext, State> {
  placeholderStyles: ViewStyleProp = {
    height: UNIT,
    marginLeft: UNIT * 2,
    backgroundColor: EStyleSheet.value('$link'),
  };
  state: State = {
    placeholderIndex: null,
    active: false,
  };
  reportMeasurements: () => void = () => {
    if (!this.refs.wrapper) {
      return;
    }

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
        onDrop: this.onDrop,
        reportMeasurements: this.reportMeasurements,
      };
      dragContext.updateZone(zoneInfo);
    });
  };

  componentDidMount() {
    this.reportMeasurements();
  }

  componentWillUnmount() {
    this.props.dragContext.removeZone(this.refs.wrapper);
  }

  componentDidUpdate() {
    this.reportMeasurements();
  }

  onMoveOver: (
    arg0: {
      x: number;
      y: number;
    },
    zone: ZoneInfo,
  ) => void = ({x, y}, zone) => {
    if (this.props.disabled) {
      return;
    }

    const relativeY = y - zone.y;
    let placeholderIndex = Math.floor(relativeY / getAgileCardHeight());
    const draggableChilds = React.Children.toArray(this.props.children)
      .filter(c => c.type === Draggable)
      .filter(c => this.props.dragContext?.dragging?.data !== c.props.data);

    if (placeholderIndex >= draggableChilds.length) {
      placeholderIndex = draggableChilds.length;
    }

    if (placeholderIndex === this.state.placeholderIndex) {
      return;
    }

    LayoutAnimation.configureNext({
      duration: 100,
      update: {
        type: 'easeInEaseOut',
      },
    });
    this.setState({
      placeholderIndex,
    });

    if (!this.state.active) {
      if (this.props.onMoveOver) {
        this.props.onMoveOver();
      }

      this.setState({
        active: true,
      });
    }
  };
  onLeave: () => void = () => {
    if (this.props.disabled) {
      return;
    }

    if (this.state.active) {
      if (this.props.onLeave) {
        this.props.onLeave();
      }

      this.setState({
        active: false,
        placeholderIndex: null,
      });
    }
  };
  onDrop: (data: any | null | undefined) => void = (
    data: Record<string, any> | null | undefined,
  ) => {
    if (this.props.disabled) {
      return;
    }

    if (this.props.onDrop) {
      this.props.onDrop(data);
    }

    this.setState({
      active: false,
      placeholderIndex: null,
    });
  };

  getChildrenWithPlaceholder(children: any) {
    const {placeholderIndex} = this.state;

    if (placeholderIndex === null || placeholderIndex === undefined) {
      return children;
    }

    const withoutMoving = React.Children.toArray(children).filter(
      (c: React.ReactElement<typeof Draggable | any>) =>
        this.props.dragContext?.dragging?.data !== c.props.data,
    );
    withoutMoving.splice(
      placeholderIndex,
      0,
      <View
        key="placeholder"
        style={[
          this.placeholderStyles,
          {
            width:
              this.props.dragContext?.dragging?.startPosition?.width || 'auto',
          },
        ]}
      />,
    );
    return withoutMoving;
  }

  render(): React.ReactNode {
    const {style, children} = this.props;
    return (
      <View style={style} onLayout={this.reportMeasurements} ref="wrapper">
        {this.getChildrenWithPlaceholder(children)}
      </View>
    );
  }
}

export default (props: Props): React.ReactNode => (
  <DragContext.Consumer>
    {dragContext => {
      if (!dragContext) {
        throw new Error('DropZone should be rendered inside <DragContainer />');
      }

      return <DropZone {...props} dragContext={dragContext} />;
    }}
  </DragContext.Consumer>
);
