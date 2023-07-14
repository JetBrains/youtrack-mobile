import React from 'react';
import {Text, View} from 'react-native';

import ModalPortal from 'components/modal-view/modal-portal';
import SelectSectioned, {
  ISectionedProps,
  ISectionedState, ISelectionedStateModal,
  SelectSectionedModal,
} from 'components/select/select-sectioned';
import Star from 'components/star/star';
import {BoardOnList} from 'types/Agile';
import {CustomError} from 'types/Error';
import {getApi} from 'components/api/api__instance';
import {notifyError} from 'components/notification/notification';
import {until} from 'util/util';

import styles from 'views/agile-board/agile-board__renderer.styles';
import stylesSelect from 'components/select/select.styles';


function renderTitle(board: BoardOnList, onSearch: (query?: string) => void): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Star
        style={styles.selectItemLeftButton}
        canStar={true}
        hasStar={board.favorite}
        onStarToggle={async () => {
          const [error]: [CustomError | null, BoardOnList] = await until(
            getApi().agile.toggleAgileBoardStar(board)
          ) as [CustomError | null, BoardOnList];
          if (error) {
            notifyError(error);
          } else {
            onSearch();
          }
        }}/>
      <Text style={stylesSelect.itemTitle}>
        {board.name}
      </Text>
    </View>
  );
}


export default class AgileSectionedSelect extends SelectSectioned<ISectionedProps, ISectionedState> {
  _renderTitle(board: BoardOnList): React.JSX.Element {
    return renderTitle(board, this._onSearch);
  }
}

export class AgileSectionedSelectModal extends SelectSectionedModal<ISectionedProps, ISelectionedStateModal> {
  _renderTitle(board: BoardOnList): React.JSX.Element {
    return renderTitle(board, this._onSearch);
  }

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

