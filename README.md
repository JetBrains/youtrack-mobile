
# YouTrack Mobile

YouTrack Mobile helps you access your YouTrack issues from anywhere, create a new issue on the fly, or quickly update an existing one.

Enjoy a clean, minimalist view of the issues, along with a search box aided by intelligent query completion. Filter issues in no time. Check issue details, comments, view attachments and join the discussion.

YouTrack Mobile is a native mobile application available for iOS and Android devices. It's written using React Native.

 Download YouTrack Mobile:
* [Google Play](https://play.google.com/store/apps/details?id=com.jetbrains.youtrack.mobile.app)
* [Apple AppStore](https://itunes.apple.com/us/app/youtrack/id1028024655?ls=1&mt=8)

 If you find any bugs in the app, please report them to our [issue tracker](https://youtrack.jetbrains.com/newissue?project=YTM&clearDraft=true).

<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXaZnlSaUphb0t6bVk" alt="YouTrack Mobile list" width="200">
<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXaZkdpQURabEY1SEk" alt="YouTrack Mobile search" width="200">
<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXaM3M5MzBXVExRUFU" alt="YouTrack Mobile issue view" width="200">
<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXadk8zMUVtWXZiWFU" alt="YouTrack Mobile issue creation" width="200">

## Contribute as Developer

If you are a developer, we invite you to help us improve this open-source app.

1. Install dependencies via `npm install` or `yarn install`.
2. Read [getting started](https://facebook.github.io/react-native/docs/getting-started.html).
3. Check code quality and type safety with `npm run lint`; run tests with `npm test`.

### iOS

#### Prepare

1. Install [XCode](https://developer.apple.com/xcode/download/) (recommended) or XCode command line tools by `xcode-select --install`.
2. Open XCode Settings, navigate to Downloads tab and download iOS 10 simulator.

#### Develop

* Run development server via `npm start`

* Compile and install app to emulator by `npm run ios`. You only need to perform this once.

#### Debug

Press CMD+D to debug while the app is running on the simulator. Refer to the official [documentation](https://facebook.github.io/react-native/docs/debugging.html).

#### Run and debug in WebStorm 2016.3

* Do not forget to set JavaScript language level to "Flow". See details [here](https://blog.jetbrains.com/webstorm/2016/11/using-flow-in-webstorm/).

* Create a new React Native run/debug configuration and select iOS as a target platform

* *Run* the created configuration to run the app (instead of `npm start` and `npm run ios`)

* To debug the app, add some breakpoints and *Debug* the created configuration. When the simulator is running, press CMD+D and select `Remote JS Debugging`.

### Android

#### Prepare
[Setup Android environment](https://facebook.github.io/react-native/docs/android-setup.html).
After setup is complete,  install project dependencies and create an Android emulator.

Install android-sdk on Mac OS X:
```sh
brew install android-sdk
```

Install all packages required for react-native Android SDK:
```sh
android update sdk --all --no-ui -t tools,platform-tools,build-tools-23.0.1,android-23\
,extra-google-google_play_services,extra-android-m2repository,extra-google-m2repository,extra-android-support
```

```sh
npm install
npm run android-emulator-create
```


#### Develop

```sh
npm start &
npm run android-emulator &
npm run android
```

#### Debug

Press CMD+M to open the debug menu for Android emulator. Refer to the official [documentation](https://facebook.github.io/react-native/docs/debugging.html).
