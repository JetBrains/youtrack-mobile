
# Development

## Common

Before doing anything install dependencies via `npm install`

## iOS

### Pepare

1. Install [XCode](https://developer.apple.com/xcode/download/) (recommended) or XCode command line tools by `xcode-select --install`
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
After setup we should install project dependencies and create android emulator

Install android-sdk on MackBook OS X
```sh
brew install android-sdk
```

Install needed for react-native android sdk packagestor-android
```sh
android update sdk --all --no-ui -t \
tools,\
platform-tool,\
build-tools-23.0.1,\
android-23,\
extra-android-support,\
extra-android-m2repository,\
sys-img-x86-android-23,\
sys-img-x86_64-android-23


# MackBook OS X only
android update sdk --all --no-ui -t extra-intel-Hardware_Accelerated_Execution_Manager

# The SDK Manager will download the installer to the "extras" directory, under the main SDK directory.
# Even though the SDK manager says "Installed" it actually means that the Intel HAXM executable was downloaded.
# You will still need to run the installer from the "extras" directory to finish installation.
# Run the installer inside the <sdk folder>/sdk/extras/intel/Hardware_Accelerated_Execution_Manager/ directory and follow the installation instructions for your platform.
# If you install throught brew then <sdk folder> will be /usr/local/Cellar/android-sdk/
# @see https://software.intel.com/en-us/android/articles/installation-instructions-for-intel-hardware-accelerated-execution-manager-mac-os-x

sudo /usr/local/Cellar/android-sdk/24.4.1_1/extras/intel/Hardware_Accelerated_Execution_Manager/silent_install.sh
```

You can look what will be installed without installation simple add flag `--dry-mode`
```sh
android update sdk --all --no-ui -t \
tools,\
platform-tool,\
build-tools-23.0.1,\
android-23,\
extra-android-support,\
extra-android-m2repository,\
sys-img-x86-android-23,\
sys-img-x86_64-android-23 \
--dry-mode
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

Official [documentation](https://facebook.github.io/react-native/docs/debugging.html)
F2 open debug menu for android emulator

Debug on real device. Install `android-tools` (aka adb) then setup device for development http://developer.android.com/intl/ru/tools/device.html#setting-up
