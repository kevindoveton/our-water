import { BaseApiType } from "../enums";
import GGMNApi from '../api/GGMNApi';
import MyWellApi from '../api/MyWellApi';


/**
 * ConfigFactory gives us the necessary components and env vars
 * based on the config of the application.
 * 
 * Inspired by: https://martinfowler.com/articles/feature-toggles.html
 */
export class ConfigFactory {
  config: any; //the firebase config object. TODO: Add type

  constructor(config: any) {
    this.config = config;

    console.log("init config factory with config", this.config);
  }

  /**
   * TODO: handle feature flags and translations!
   */
  getApplicationName() {
    if (this.config.applicationName) {
      return this.config.applicationName;
    }

    //Default
    return 'MyWell';
  }

  /**
   * Return 
   */
  getBaseApi(auth: any) {
    //TODO: should 
    if (this.config.baseApi === BaseApiType.GGMNApi) {
      return new GGMNApi({});
    }

    //Default to MyWellApi
    return new MyWellApi();
  }

  showConnectToButton() {
    if (this.config.showConnectToButton) {
      return true;
    }

    return false;
  }

  getConnectToButtonText() {
    if (!this.config.showConnectToButton) {
      console.warn("showConnectToButton is disabled. Text should be null");
      return null;
    }

    return this.config.connectToButtonText;
  }

}