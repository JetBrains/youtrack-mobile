import React from 'react';

import {ImageItemConfig} from 'react-native-ios-context-menu/src/types/ImageItemConfig';

import type {MenuConfig, MenuActionConfig, IconConfig} from 'react-native-ios-context-menu';


export interface ContextMenuConfigItem extends MenuActionConfig {
  execute: () => any;
  icon?: IconConfig | (ImageItemConfig & { svg?: string })
  svg?: () => React.FC<React.SVGAttributes<SVGElement>>
}

export interface ContextMenuConfig extends MenuConfig {
  menuItems: ContextMenuConfigItem[];
}
