import {HapticFeedbackTypes, trigger} from 'react-native-haptic-feedback';

const options = {enableVibrateFallback: true, ignoreAndroidSystemSettings: true} as const;

export const hapticType: HapticFeedbackTypes = HapticFeedbackTypes.impactMedium;

export function hapticTrigger(type: HapticFeedbackTypes = hapticType) {
  try {
    trigger(type, options);
  } catch {
  }
}
