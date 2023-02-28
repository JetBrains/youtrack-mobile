import * as React from 'react';

// @ts-ignore
import ContextMenu from 'components/context-menu/context-menu';

import {ContextMenuConfig, ContextMenuConfigItem} from 'types/MenuConfig';


const ContextActionsProvider = ({
  children,
  menuConfig = {menuTitle: '', menuItems: []},
}: { children: React.ReactNode, menuConfig: ContextMenuConfig }) => {
  return (
    <ContextMenu
      menuConfig={menuConfig}
      onPress={(actionKey: string) => {
        const targetItem: ContextMenuConfigItem | undefined = menuConfig.menuItems.find(
          (it: ContextMenuConfigItem) => it.actionKey === actionKey
        );
        targetItem?.execute?.();
      }}
    >
      {children}
    </ContextMenu>
  );
};


export default ContextActionsProvider;
