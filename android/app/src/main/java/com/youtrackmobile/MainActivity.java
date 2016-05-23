package com.jetbrains.youtrack.mobile.app;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import com.imagepicker.ImagePickerPackage;
import android.content.Intent;

import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity {
    private ImagePickerPackage mImagePicker;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "YouTrackMobile";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        mImagePicker = new ImagePickerPackage(this);

        return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                mImagePicker);
    }

    // handle onActivityResult
    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        mImagePicker.handleActivityResult(requestCode, resultCode, data);
    }

}
