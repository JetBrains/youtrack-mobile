import React from 'react';
import {ContextMenuView} from 'react-native-ios-context-menu';
import {ContextMenuConfig} from 'types/MenuConfig';


interface Props {
  children: React.ReactNode;
  menuConfig: ContextMenuConfig;
  onPress: (actionKey: string, actionTitle: string) => any;
}

const ContextMenu: React.FC<Props> = ({children, menuConfig, onPress = () => null}: Props) => {
  return (
    <ContextMenuView
      isContextMenuEnabled={!!menuConfig}
      menuConfig={menuConfig}
      onPressMenuItem={({nativeEvent}) => onPress(nativeEvent.actionKey, nativeEvent.actionTitle)}
    >
      {children}
    </ContextMenuView>
  );
};

export default React.memo(ContextMenu);
