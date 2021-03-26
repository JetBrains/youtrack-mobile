module.exports = {
  'test-runner': 'jest',
  specs: 'e2e',
  'runner-config': 'e2e/config.json',
  behavior: {
    init: {
      exposeGlobals: true,
    },
  },
  apps: {
    'ios.release': {
      type: 'ios.app',
      binaryPath: './ios/build/Build/Products/Release-iphonesimulator/YouTrackMobile.app',
      build: 'RN_SRC_EXT=e2e.js xcodebuild -workspace ios/YouTrackMobile.xcworkspace -scheme YouTrackMobile[Release] -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.debug': {
      type: 'ios.app',
      binaryPath: './ios/build/Build/Products/Debug-iphonesimulator/YouTrackMobile.app',
      build: 'RN_SRC_EXT=e2e.js xcodebuild -workspace ios/YouTrackMobile.xcworkspace -scheme YouTrackMobile -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 11 Pro',
      },
    },
  },
  configurations: {
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
  },
};
