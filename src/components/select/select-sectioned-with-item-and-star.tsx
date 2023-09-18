import React from 'react';
import {Text} from 'react-native';

import ModalPortal from 'components/modal-view/modal-portal';
import SelectSectioned, {
  ISectionedProps,
  ISectionedState, SelectSectionedModal,
} from 'components/select/select-sectioned';
import Star from 'components/star/star';
import {notifyError} from 'components/notification/notification';
import {until} from 'util/util';

import styles from './select.styles';

import {CustomError} from 'types/Error';
import {IItem} from 'components/select/select';


export interface ISSWithItemActionsProps extends ISectionedProps {
  onStar(item: any): void;
  hasStar(item: any): boolean;
}

interface ISSWithItemActionsState extends ISectionedState {
  visible: boolean;
}

export class SectionedSelectWithItemActions<P extends ISSWithItemActionsProps, S extends ISSWithItemActionsState> extends SelectSectioned<P, S> {
  _renderTitle(item: IItem): React.ReactNode {
    const name: string = `${item.name}${item.shortName ? ` (${item.shortName})` : ''}`;
    return (
      <>
        {!!item.id && <Star
          style={styles.itemStar}
          canStar={true}
          hasStar={this.props.hasStar(item)}
          onStarToggle={async () => {
            const [error]: [CustomError | null, any] = await until(this.props.onStar(item)) as [CustomError | null, any];
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

export class SectionedSelectWithItemActionsModal<P extends ISSWithItemActionsProps, S extends ISSWithItemActionsState> extends SelectSectionedModal<P, S> implements SectionedSelectWithItemActions<P, S> {
  render: () => React.ReactNode = (): React.ReactNode => {
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
