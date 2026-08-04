package com.jetbrains.youtrack.mobile.app

import android.R
import android.content.Intent
import android.os.Bundle
import android.view.View
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "YouTrackMobile"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
    }

    /**
     * When the OS delivers a re-launch intent (notification/deep-link tap) to
     * this already-running activity instead of recreating it, forward it to the
     * React delegate (via `super`) so react-native-notifications'
     * `RNNotificationsModule` (an `ActivityEventListener`) emits
     * `notificationOpened` on the live JS context and navigation happens on the
     * existing stack — no app re-bootstrap. `setIntent` keeps `getIntent()`
     * pointing at the latest intent. This is purely additive: it does not change
     * the activity's launch/task semantics (`launchMode` stays `singleInstance`).
     */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
            DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
