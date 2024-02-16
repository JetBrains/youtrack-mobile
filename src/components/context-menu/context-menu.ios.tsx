import React from 'react';
import {ContextMenuView} from 'react-native-ios-context-menu';
import {ContextMenuConfig} from 'types/MenuConfig';

interface Props {
  children: React.ReactNode;
  menuConfig: ContextMenuConfig;
  onPress: (actionKey: string, actionTitle: string) => any;
  auxiliaryPreview?: () => React.ReactElement;
}

const ContextMenu = ({children, menuConfig, onPress = () => null, auxiliaryPreview}: Props) => {
  return (
    <ContextMenuView
      auxiliaryPreviewConfig={{
        alignmentHorizontal: 'previewCenter',
        anchorPosition: 'automatic',
        transitionEntranceDelay: 0.4,
      }}
      renderAuxiliaryPreview={auxiliaryPreview}
      isContextMenuEnabled={!!menuConfig}
      menuConfig={menuConfig}
      onPressMenuItem={({nativeEvent}) => onPress(nativeEvent.actionKey, nativeEvent.actionTitle)}
    >
      {children}
    </ContextMenuView>
  );
};

export default React.memo(ContextMenu);
