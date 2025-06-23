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

import type {AnyError} from 'types/Error';
import type {IItem} from 'components/select/select';
import type {Tag} from 'types/CustomFields';


export interface ISSWithItemActionsProps extends ISectionedProps {
  onStar(item: IItem): Promise<AnyError | Tag>;
  hasStar(item: IItem): boolean;
}

interface ISSWithItemActionsState extends ISectionedState {
  visible: boolean;
}

export class SectionedSelectWithItemActions<S extends ISSWithItemActionsState = ISSWithItemActionsState> extends SelectSectioned<S> {
  _renderTitle(item: IItem) {
    const name: string = `${item.name}${item.shortName ? ` (${item.shortName})` : ''}`;
    return (
      <>
        {!!item.id && <Star
          style={styles.itemStar}
          canStar={true}
          hasStar={(this.props as ISSWithItemActionsProps).hasStar(item)}
          onStarToggle={async () => {
            const [error] = await until((this.props as ISSWithItemActionsProps).onStar(item));
            if (error) {
              notifyError(error);
            } else {
              this._onSearch(this.state.query);
            }
          }}/>}
        <Text style={styles.itemTitle}>
          {name}
        </Text>
      </>
    );
  }
}

export class SectionedSelectWithItemActionsModal<S extends ISSWithItemActionsState = ISSWithItemActionsState> extends SelectSectionedModal<S> {
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
