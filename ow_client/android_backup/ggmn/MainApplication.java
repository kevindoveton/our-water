package com.vesselstech.ggmn;

import android.app.Application;

import com.reactnativenavigation.NavigationApplication;

import com.facebook.react.ReactApplication;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.reactnativenavigation.NavigationReactPackage;
import com.horcrux.svg.SvgPackage;
import org.gamega.RNAsyncStoragePackage;
import com.oblador.keychain.KeychainPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

//react-native-maps
import com.airbnb.android.react.maps.MapsPackage;

//react-native-firebase
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.firestore.RNFirebaseFirestorePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage;
// import io.invertase.firebase.functions.RNFirebaseFunctionsPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

  @Override
  public boolean isDebug() {
      // Make sure you are using BuildConfig from your own application
      return BuildConfig.DEBUG;
  }

  protected List<ReactPackage> getPackages() {
      // Add additional packages you require here
      // No need to add RnnPackage and MainReactPackage
        return Arrays.<ReactPackage>asList(
          // new MainReactPackage(),
            new SplashScreenReactPackage(),
            new NavigationReactPackage(),
          new SvgPackage(),
          new RNAsyncStoragePackage(),
          new KeychainPackage(),
          new VectorIconsPackage(),
          new ReactNativeConfigPackage(),
          new MapsPackage(),
          new RNFirebasePackage(),
          new RNFirebaseFirestorePackage(),
          new RNFirebaseAuthPackage(),
          new RNFirebaseRemoteConfigPackage()
        //   new RNFirebaseFunctionsPackage()
      );
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
      return getPackages();
  }

  @Override
  public String getJSMainModuleName() {
      return "index";
  }

  // @Override
  // public ReactNativeHost getReactNativeHost() {
  //   return mReactNativeHost;
  // }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }

  // private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
  //   @Override
  //   public boolean getUseDeveloperSupport() {
  //     return BuildConfig.DEBUG;
  //   }

  //   @Override
  //   protected List<ReactPackage> getPackages() {
  //     return Arrays.<ReactPackage>asList(
  //         new MainReactPackage(),
  //         new VectorIconsPackage(),
  //         new ReactNativeConfigPackage(),
  //         new MapsPackage(),
  //         new RNFirebasePackage(),
  //         new RNFirebaseFirestorePackage(),
  //         new RNFirebaseAuthPackage()
  //     );
  //   }

  //   @Override
  //   protected String getJSMainModuleName() {
  //     return "index";
  //   }
  // };
}