
# YouTrack Mobile

With YouTrack Mobile you are free to access your issue from anywhere, create a new issue on the fly, or update an existing one.
Enjoy a clean, minimalistic view of the issues, along with the search box aided by intelligent query completion. Filter issues in no time.
Of course, you can check issue details, comments, view attachments and join the conversation.

![YouTrack logo](https://github.com/JetBrains/youtrack-mobile/blob/master/src/components/icon/youtrack-logo-512.png?raw=true)

## Development

1. Before doing anything install dependencies via `npm install` or `yarn install`
2. Read [getting started](https://facebook.github.io/react-native/docs/getting-started.html).
### iOS

#### Pepare

1. Install [XCode](https://developer.apple.com/xcode/download/) (recommended) or XCode command line tools by `xcode-select --install`
2. Into XCode settings, go to "Downloads" tab and download iOS 10 simulator

### Develop

* Run development server via `npm start`

* Compile and install app to emulator by `npm run ios`. It's enough to perform this once.

To debug, press CMD+D while app is running in the simulator. Here is [documentation](https://facebook.github.io/react-native/docs/debugging.html).

## Android

### Prepare
Before start to develop you should [setup Android environment](https://facebook.github.io/react-native/docs/android-setup.html)
After setup we should install project dependencies and create android emulator

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

Official [documentation](https://facebook.github.io/react-native/docs/debugging.html). CMD+M opens debug menu for android emulator
