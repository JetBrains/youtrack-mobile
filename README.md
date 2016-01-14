
# Development

## Common

Before doing anything install dependencies via `npm install`

## iOS

### Pepare

1. Install (XCode)[https://developer.apple.com/xcode/download/] (recommended) or XCode command line tools by `xcode-select --install`
2. Into XCode settings, go to "Downloads" tab and download iOS 9.2 emulator

### Develop

* Run development server via 
```sh
npm start
```

* Compile and install app to emulator by `npm run ios`. You can do it only one time and repeat it again on changes in XCode project.

* To run project in ios simulator, install xcode, iphone 6 plus simulator and run `npm run ios`

To debug, press CMD+D on running in emulator application.

### Debugging

Official [documentation](https://facebook.github.io/react-native/docs/debugging.html)
To debug, press CMD+D on running in emulator application.

## Android

### Prepare

Before start to develop you should [setup Android environment](https://facebook.github.io/react-native/docs/android-setup.html)
After setup we should create android emulator:

```sh
npm run android-emulator-create
```


### Develop

```sh
npm start &
npm run android-emulator &
npm run android
```

### Debugging

Official [documentation](https://facebook.github.io/react-native/docs/debugging.html)
F2 open debug menu for android emulator
