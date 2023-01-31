import React from 'react';

import {ContextMenuConfig, ContextMenuConfigItem} from 'types/MenuConfig';

interface Props {
  children: React.ReactNode;
  menuConfig: ContextMenuConfig;
  onPress: (item: ContextMenuConfigItem) => any;
  onToggle: () => any;
}

const ContextMenu: React.FC<Props> = ({children}: Props) => <>{children}</>;

export default React.memo(ContextMenu);
