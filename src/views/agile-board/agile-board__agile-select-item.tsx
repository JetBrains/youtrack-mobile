import React from 'react';
import {Text, View} from 'react-native';

import Star from 'components/star/star';
import {getApi} from 'components/api/api__instance';
import {notifyError} from 'components/notification/notification';
import {until} from 'util/util';

import styles from './agile-board__renderer.styles';
import stylesSelect from 'components/select/select.styles';

import {BoardOnList} from 'types/Agile';
import {CustomError} from 'types/Error';


const AgileSelectItemStar = ({board}: { board: BoardOnList }) => {
  const [hasStar, setHasStar] = React.useState(board.favorite);
  return (
    <View style={styles.row}>
      <Star
        style={styles.selectItemLeftButton}
        canStar={true}
        hasStar={hasStar}
        onStarToggle={async () => {
          // @ts-ignore
          const [error, updatedBoard]: [CustomError | null, BoardOnList] = await until(
            getApi().agile.toggleAgileBoardStar(board)
          );
          if (error) {
            notifyError(error);
          } else {
            setHasStar(updatedBoard.favorite);
          }
        }}/>
      <Text style={stylesSelect.itemTitle}>
        {board.name}
      </Text>
    </View>
  );
};


export default React.memo(AgileSelectItemStar);
