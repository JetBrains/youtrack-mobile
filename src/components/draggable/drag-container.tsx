/**
 * Original author: deanmcpherson
 * Modification of https://github.com/deanmcpherson/react-native-drag-drop
 */
import * as React from 'react';
import {
  View,
  PanResponder,
  Modal,
  Easing,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
type Draggable = typeof import('./draggable').default;
import DropZone, {ZoneInfo} from './drop-zone';
type DraggingInfo = {
  ref: React.Ref<Draggable> | null | undefined;
  data: Record<string, any>;
  children: React.ReactNode;
  startPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
export type DragContextType = {
  dropZones: Array<ZoneInfo>;
  onInitiateDrag: (
    ref: Record<string, any>,
    children: React.ReactNode,
    data: Record<string, any>,
  ) => any;
  dragging: DraggingInfo | null | undefined;
  updateZone: (arg0: ZoneInfo) => any;
  removeZone: (arg0: React.Ref<typeof DropZone>) => any;
  registerOnDragStart: (...args: Array<any>) => any;
  registerOnDrag: (...args: Array<any>) => any;
  registerOnDrop: (...args: Array<any>) => any;
};
export const DragContext: React.Context<
  DragContextType | null | undefined
> = React.createContext<DragContextType | null | undefined>(null);

class DragModal extends React.Component<any, void> {
  onRequestClose = () => true;

  render() {
    return (
      <Modal transparent onRequestClose={this.onRequestClose}>
        <TouchableWithoutFeedback onPressIn={this.props.drop}>
          <Animated.View style={this.props.location.getLayout()}>
            {this.props.content.children}
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

type Props = {
  onDragStart: (...args: Array<any>) => any;
  reportOnDrop: (...args: Array<any>) => any;
  onDragEnd: (
    arg0: Record<string, any> | null | undefined,
    arg1: Array<ZoneInfo>,
  ) => any;
  style?: any;
  children?: any;
};
type State = {
  location: Animated.ValueXY;
  draggingComponent: DraggingInfo | null | undefined;
};

class DragContainer extends React.Component<Props, State> {
  _listener: string;
  _point:
    | {
        x: number;
        y: number;
      }
    | null
    | undefined = null;
  _offset:
    | {
        x: number;
        y: number;
      }
    | null
    | undefined = null;
  _locked: boolean = false;
  _panResponder: Record<string, any>;
  state: State = {
    location: new Animated.ValueXY(),
    draggingComponent: null,
  };
  dropZones: Array<Record<string, any>> = [];
  draggables: Array<Record<string, any>> = [];

  constructor(props: Props) {
    super(props);
    this._listener = this.state.location.addListener(this._handleDragging);
  }

  componentWillUnmount() {
    if (this._listener) {
      this.state.location.removeListener(this._listener);
    }
  }

  reportOnDragStart: (...args: Array<any>) => any = () => {};
  reportOnDrag: (...args: Array<any>) => any = () => {};
  reportOnDrop: (...args: Array<any>) => any = () => {};

  getDragContext(): DragContextType {
    return {
      dropZones: this.dropZones,
      onInitiateDrag: this.onInitiateDrag,
      dragging: this.state.draggingComponent || null,
      updateZone: this.updateZone,
      removeZone: this.removeZone,
      registerOnDragStart: this.registerOnDragStart,
      registerOnDrag: this.registerOnDrag,
      registerOnDrop: this.registerOnDrop,
    };
  }

  updateZone: (details: ZoneInfo) => void = (details: ZoneInfo) => {
    const zone = this.dropZones.find(x => x.ref === details.ref);

    if (!zone) {
      this.dropZones.push(details);
    } else {
      const i = this.dropZones.indexOf(zone);
      this.dropZones.splice(i, 1, details);
    }
  };
  removeZone = (ref: React.Ref<DropZone>) => {
    this.dropZones = this.dropZones.filter(z => z.ref !== ref);
  };

  inZone(
    {
      x,
      y,
    }: {
      x: number;
      y: number;
    },
    zone: ZoneInfo,
  ): boolean {
    return (
      zone.x <= x &&
      zone.width + zone.x >= x &&
      zone.y <= y &&
      zone.height + zone.y >= y
    );
  }

  registerOnDragStart: (onDragStart: any) => void = (
    onDragStart: (...args: Array<any>) => any,
  ) => {
    this.reportOnDragStart = onDragStart;
  };
  registerOnDrag: (onDrag: any) => void = (
    onDrag: (...args: Array<any>) => any,
  ) => {
    this.reportOnDrag = onDrag;
  };
  registerOnDrop: (onDrop: any) => void = (
    onDrop: (...args: Array<any>) => any,
  ) => {
    this.reportOnDrop = onDrop;
  };

  _addLocationOffset(cornerPoint) {
    if (!this.state.draggingComponent) {
      return cornerPoint;
    }

    const {startPosition} = this.state.draggingComponent;
    return {
      x: cornerPoint.x + startPosition.width / 2,
      y: cornerPoint.y + startPosition.height / 2,
    };
  }

  _handleDragging = point => {
    this._point = point;

    if (this._locked || !point) {
      return;
    }

    this.dropZones.forEach(zone => {
      if (this.inZone(point, zone)) {
        zone.onMoveOver(point, zone);
      } else {
        zone.onLeave(point);
      }
    });
  };
  _handleDrop = () => {
    this.reportOnDrop();
    const hitZones = [];
    this.dropZones.forEach(zone => {
      if (!this._point) {
        return;
      }

      if (this.inZone(this._point, zone)) {
        hitZones.push(zone);
        zone.onDrop(this.state.draggingComponent?.data);
      }
    });

    if (this.props.onDragEnd) {
      this.props.onDragEnd(this.state.draggingComponent, hitZones);
    }

    if (
      !hitZones.length &&
      this.state.draggingComponent &&
      this.state.draggingComponent.ref
    ) {
      this._locked = true;
      return Animated.timing(this.state.location, {
        duration: 400,
        easing: Easing.elastic(1),
        toValue: {
          x: 0,
          //this._offset.x - x,
          y: 0, //his._offset.y - y
        },
      }).start(() => {
        this._locked = false;
        this.setState({
          draggingComponent: null,
        });
      });
    }

    this.setState({
      draggingComponent: null,
    });
  };

  UNSAFE_componentWillMount() {
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: () => {
        if (this.state.draggingComponent) {
          this._handleDrop();
        }

        return false;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        !!this.state.draggingComponent,
      //        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderMove: (...args) =>
        Animated.event([
          null,
          {
            dx: this.state.location.x,
            // x,y are Animated.Value
            dy: this.state.location.y,
          },
        ]).apply(this, args),
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (!this.state.draggingComponent) {
          return;
        }

        //Ensures we exit all of the active drop zones
        this._handleDrop();
      },
    });
  }

  onInitiateDrag: (ref: any, children: any, data: any) => void = (
    ref: Record<string, any>,
    children: any,
    data: Record<string, any>,
  ) => {
    this.reportOnDragStart();
    ref.measure((x, y, width, height, pageX, pageY) => {
      if (this._listener) {
        this.state.location.removeListener(this._listener);
      }

      const location = new Animated.ValueXY();
      this._listener = location.addListener(cornerPoint => {
        this._handleDragging(this._addLocationOffset(cornerPoint));

        this.reportOnDrag({
          point: cornerPoint,
          width: this.state.draggingComponent?.startPosition.width,
          height: this.state.draggingComponent?.startPosition.height,
        });
      });
      this._offset = {
        x: pageX,
        y: pageY,
      };
      location.setOffset(this._offset);
      this.setState(
        {
          location,
          draggingComponent: {
            ref,
            data,
            children: React.Children.map(children, child => {
              return React.cloneElement(child, {
                dragging: true,
                dropZoneWidth: width,
              });
            }),
            startPosition: {
              x: pageX,
              y: pageY,
              width,
              height,
            },
          },
        },
        () => {
          if (this.props.onDragStart) {
            this.props.onDragStart(this.state.draggingComponent);
          }
        },
      );
    });
  };

  render(): React.ReactNode {
    return (
      <DragContext.Provider value={this.getDragContext()}>
        <View
          style={[
            {
              flex: 1,
            },
            this.props.style,
          ]}
          {...this._panResponder.panHandlers}
        >
          {this.props.children}
          {this.state.draggingComponent ? (
            <DragModal
              content={this.state.draggingComponent}
              location={this.state.location}
              drop={this._handleDrop}
            />
          ) : null}
        </View>
      </DragContext.Provider>
    );
  }
}

export default DragContainer;
