import React, {forwardRef, useCallback} from 'react';

import {RefreshControl as RNRefreshControl} from 'react-native';

import {hapticTrigger} from './haptic';

import type {RefreshControlProps} from 'react-native';

export const RefreshControl = forwardRef<RNRefreshControl, RefreshControlProps>((props, ref) => {
  const {onRefresh, ...rest} = props;

  const handleRefresh = useCallback(() => {
    try {
      hapticTrigger();
    } catch {
      // noop
    }
    if (typeof onRefresh === 'function') {
      onRefresh();
    }
  }, [onRefresh]);

  return <RNRefreshControl ref={ref} onRefresh={handleRefresh} {...rest} />;
});

RefreshControl.displayName = 'HapticRefreshControl';
