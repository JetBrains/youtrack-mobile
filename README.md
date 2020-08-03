
# YouTrack Mobile ![](http://jb.gg/badges/official-flat-square.svg)

YouTrack Mobile app lets you stay on track with your tasks while you're on the go:

* Easily work with your projects and tasks from anywhere. You can create, view, and update them, in addition to adding images and other files.
* Stay on track with real-time notifications about activity in your tasks and projects.
* Contact team members and collaborate directly with them; just use @ to mention your colleagues in the issue’s comments.
* View and organize your boards.

YouTrack Mobile is written in React Native together with Redux and Flow and available for iOS and Android platforms.

## Installation
* [Google Play](https://play.google.com/store/apps/details?id=com.jetbrains.youtrack.mobile.app)
* [Apple AppStore](https://itunes.apple.com/us/app/youtrack/id1028024655?ls=1&mt=8)

<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXaZnlSaUphb0t6bVk" alt="YouTrack Mobile list" width="200">
<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXaZkdpQURabEY1SEk" alt="YouTrack Mobile search" width="200">
<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXaM3M5MzBXVExRUFU" alt="YouTrack Mobile issue view" width="200">
<img src="https://drive.google.com/uc?export=&id=0B6BBCd1L_wXadk8zMUVtWXZiWFU" alt="YouTrack Mobile issue creation" width="200">

## Bug and Issue Tracker
Should you have and problems, report them to the [YouTrack Mobile issue tracker](https://youtrack.jetbrains.com/newissue?project=YTM&clearDraft=true).

## Contributing

YouTrack Mobile is an open source project and we are very happy to accept community contributions.

### Prerequisites
Before submitting PR's, read:
* [React Native getting started](https://facebook.github.io/react-native/docs/getting-started.html)
* [React Native debugging](https://facebook.github.io/react-native/docs/debugging.html)


### Installation
```
yarn install
```

### iOS

1. Install [XCode](https://developer.apple.com/xcode/download/).
   It's also recommended to install Xcode command line tools `xcode-select --install`.
2. From Xcode settings download an iOS simulator.

### Android
[Setup Android environment](https://facebook.github.io/react-native/docs/getting-started.html#android-development-environment).

### Development

1. Start a development server `yarn start`
2. Perform `yarn ios` or `yarn android-emulator && yarn android`.
3. Perform error check `yarn lint`
3. Run tests `yarn test`
