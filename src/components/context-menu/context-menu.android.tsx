import React from 'react';
import {View} from 'react-native';

import {ContextMenuConfig, ContextMenuConfigItem} from 'types/MenuConfig';

interface Props {
  children: React.ReactNode;
  menuConfig: ContextMenuConfig;
  onPress: (item: ContextMenuConfigItem) => any;
  onToggle: () => any;
}

const ContextMenu: React.FC<Props> = ({children}: Props) =>
  <View>{children}</View>;

export default React.memo(ContextMenu);
