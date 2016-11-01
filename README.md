
# YouTrack Mobile

YouTrack Mobile helps you to access your issues from anywhere, create a new issue on the fly, or update an existing one.
Enjoy a clean, minimalistic view of the issues, along with the search box aided by intelligent query completion. Filter issues in no time.
Of course, you can check issue details, comments, view attachments and join the conversation.
YouTrack Mobile is a native mobile application available for iOS and Android devices. It's written on React Native.

 Download YouTrack Mobile:
* [Google Play](https://play.google.com/store/apps/details?id=com.jetbrains.youtrack.mobile.app)
* [Apple AppStore [TODO: add link]]()

 Report bugs to our [issue tracker](https://youtrack.jetbrains.com/newissue?project=YTM&clearDraft=true).

<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXacS1aUEk3RlFEMTg" alt="YouTrack Mobile screenshot" width="200">

### Development

1. Install dependencies via `npm install` or `yarn install`.
2. Read [getting started](https://facebook.github.io/react-native/docs/getting-started.html).
3. Check code quality and type safety with `npm run lint`, run tests with `npm test`.

### iOS

#### Pepare

1. Install [XCode](https://developer.apple.com/xcode/download/) (recommended) or XCode command line tools by `xcode-select --install`.
2. Open XCode Settings, navigate to Downloads tab and download iOS 10 simulator.

### Develop

* Run development server via `npm start`

* Compile and install app to emulator by `npm run ios`. You only need to perform this once.

Click CMD+D to debug while app is running on the simulator. Find more details in the [documentation](https://facebook.github.io/react-native/docs/debugging.html).

## Android

### Prepare
[Setup Android environment](https://facebook.github.io/react-native/docs/android-setup.html)
When setup is complited you need to install project dependencies and create Android emulator.

Install android-sdk on MackBook OS X
```sh
brew install android-sdk
```

Install needed for react-native android sdk packagestor-android
```sh
android update sdk --all --no-ui -t tools,platform-tools,build-tools-23.0.1,android-23\
,extra-google-google_play_services,extra-android-m2repository,extra-google-m2repository,extra-android-support
```

```sh
npm install
npm run android-emulator-create
```


### Develop

```sh
npm start &
npm run android-emulator &
npm run android
```

### Debugging

Official [documentation](https://facebook.github.io/react-native/docs/debugging.html). Press CMD+M to open the debug menu for Android emulator.
