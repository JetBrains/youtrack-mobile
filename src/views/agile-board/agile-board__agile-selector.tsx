import SelectSectioned, {ISectionedProps, ISectionedState} from 'components/select/select-sectioned';
import React from 'react';
import {Text, View} from 'react-native';
import styles from 'views/agile-board/agile-board__renderer.styles';
import Star from 'components/star/star';
import {CustomError} from 'types/Error';
import {BoardOnList} from 'types/Agile';
import {until} from 'util/util';
import {getApi} from 'components/api/api__instance';
import {notifyError} from 'components/notification/notification';
import stylesSelect from 'components/select/select.styles';

export default class AgileSectionedSelect extends SelectSectioned<ISectionedProps, ISectionedState> {
  _renderTitle(board: BoardOnList): React.ReactNode {
      return (
        <View style={styles.row}>
          <Star
            style={styles.selectItemLeftButton}
            canStar={true}
            hasStar={board.favorite}
            onStarToggle={async () => {
              // @ts-ignore
              const [error]: [CustomError | null, BoardOnList] = await until(
                getApi().agile.toggleAgileBoardStar(board)
              );
              if (error) {
                notifyError(error);
              } else {
                this._onSearch();
              }
            }}/>
          <Text style={stylesSelect.itemTitle}>
            {board.name}
          </Text>
        </View>
      );
  }
}
