import React from 'react';
import {Text} from 'react-native';

import ModalPortal from 'components/modal-view/modal-portal';
import SelectSectioned, {
  ISectionedProps,
  ISectionedState,
  SelectSectionedModal,
} from 'components/select/select-sectioned';
import Star from 'components/star/star';
import {notifyError} from 'components/notification/notification';
import {until} from 'util/util';

import styles from './select.styles';

import type {IItem} from 'components/select/select';


export interface ISSWithItemActionsProps<T extends IItem> extends ISectionedProps<T> {
  onStar(item: T): Promise<unknown>;
  hasStar(item: T): boolean;
}

interface ISSWithItemActionsState<T extends IItem> extends ISectionedState<T> {
  visible: boolean;
}

export class SectionedSelectWithItemActions<
  T extends IItem = IItem,
  S extends ISSWithItemActionsState<T> = ISSWithItemActionsState<T>,
> extends SelectSectioned<T, S> {
  private readonly sectionedProps: ISSWithItemActionsProps<T>;

  constructor(props: ISSWithItemActionsProps<T>) {
    super(props);
    this.sectionedProps = props;
  }

  _renderTitle(item: T) {
    const name: string = `${item.name}${item.shortName ? ` (${item.shortName})` : ''}`;
    return (
      <>
        {!!item.id && <Star
          style={styles.itemStar}
          canStar={true}
          hasStar={this.sectionedProps.hasStar(item)}
          onStarToggle={async () => {
            const [error] = await until(this.sectionedProps.onStar(item));
            if (error) {
              notifyError(error);
            } else {
              this.onSearch(this.state.query);
            }
          }}/>}
        <Text style={styles.itemTitle}>
          {name}
        </Text>
      </>
    );
  }
}

export class SectionedSelectWithItemActionsModal<
  T extends IItem = IItem,
  S extends ISSWithItemActionsState<T> = ISSWithItemActionsState<T>,
> extends SelectSectionedModal<T, S> {
  render = () => {
    return (
      <ModalPortal
        testID="test:id/selectModalContainer"
        style={styles.modalPortalSelectContent}
        onHide={this.onCancel}
      >
        {this.state.visible && this.renderContent()}
      </ModalPortal>
    );
  };
}
