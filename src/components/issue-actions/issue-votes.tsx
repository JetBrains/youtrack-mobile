import * as React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {HIT_SLOP, secondaryText, UNIT} from 'components/common-styles';
import {IconThumbUp} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';

import {Theme} from 'types/Theme';

interface Props {
  voted: boolean;
  votes: number;
  canVote: boolean;
  onVoteToggle: (voted: boolean) => any;
}


export default function (props: Props) {
  const theme: Theme = React.useContext(ThemeContext);
  const {voted, votes, canVote, onVoteToggle} = props;

  const toggle = () => onVoteToggle(!voted);

  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      disabled={!canVote}
      style={styles.button}
      onPress={toggle}
    >
      <Text style={styles.counter}>{votes || 0}</Text>
      <IconThumbUp
        isActive={voted}
        size={20}
        color={
          canVote ? theme.uiTheme.colors.$iconAccent : theme.uiTheme.colors.$disabled
        }
      />
    </TouchableOpacity>
  );
}

const styles = EStyleSheet.create({
  button: {
    marginLeft: UNIT * 0.75,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  counter: {
    marginRight: UNIT,
    ...secondaryText,
    color: '$icon',
  },
});
