
# YouTrack Mobile ![](http://jb.gg/badges/official-flat-square.svg)

YouTrack Mobile app lets you stay on track with your tasks while you're on the go:

* Easily work with your projects and tasks no matter where you are. You can create, view, and update issues, as well as attach images and other files.
* Stay on track with real-time notifications about activity in your tasks and projects.
* Alert members of your team regarding changes that require their attention. Use the @ sign to mention a colleague in an issue comment.
* View and organize your issues on agile boards.

YouTrack Mobile is written in React Native together with Redux and Flow. The app is available for iOS and Android platforms.

## Installation
* [Google Play](https://play.google.com/store/apps/details?id=com.jetbrains.youtrack.mobile.app)
* [Apple App Store](https://itunes.apple.com/us/app/youtrack/id1028024655?ls=1&mt=8)

## Bug and Issue Tracker
Should you have any problems, report them to the [YouTrack Mobile issue tracker](https://youtrack.jetbrains.com/newissue?project=YTM&clearDraft=true).

## Contributing

YouTrack Mobile is an open-source project. We are very happy to accept community contributions.

### Prerequisites
Before submitting PR's, read:
* [React Native getting started](https://facebook.github.io/react-native/docs/getting-started.html)
* [React Native debugging](https://facebook.github.io/react-native/docs/debugging.html)


### Installation
```
yarn install
```

### iOS

1. Install [Xcode](https://developer.apple.com/xcode/download/).
   It's also recommended to install Xcode command line tools `xcode-select --install`.
2. From Xcode settings download an iOS simulator.

### Android
[Setup Android environment](https://facebook.github.io/react-native/docs/getting-started.html#android-development-environment).

### Development

1. Start a development server `yarn start`
2. Perform `yarn ios` or `yarn android-emulator && yarn android`.
3. Perform error check `yarn lint`
4. Run tests `yarn test`
