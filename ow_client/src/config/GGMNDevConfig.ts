import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType, HomeScreenType } from "../enums";

//TODO: make this much more typesafe etc.
const GGMNDevConfig: RemoteConfig = {
  applicationName: 'GGMN',
  baseApiType: BaseApiType.GGMNApi,
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net',
  showConnectToButton: true,
  mywellBaseUrl: '',
  map_shouldLoadAllResources: false,
  newReading_enableImageUpload: false,
  // homeScreen: HomeScreenType.Map,
  homeScreen: HomeScreenType.Simple,
}

export default GGMNDevConfig;