
import BaseApi from './BaseApi';
import NetworkApi from './NetworkApi';
import FirebaseApi from './FirebaseApi';
import { DeprecatedResource, SearchResult, OWUser, Reading, SaveReadingResult, SaveResourceResult, TimeseriesRange, OWUserStatus } from '../typings/models/OurWater';
import UserApi from './UserApi';
import { SomeResult, ResultType, resultsHasError, makeError, makeSuccess } from '../typings/AppProviderTypes';
import { TranslationEnum } from 'ow_translations';
import { RNFirebase, Firebase } from "react-native-firebase";
import { Region } from "react-native-maps";
import { AnyResource } from '../typings/models/Resource';
import { AnyReading } from '../typings/models/Reading';
import { PendingReading } from '../typings/models/PendingReading';
import { PendingResource } from '../typings/models/PendingResource';
import { AnonymousUser, FullUser } from '../typings/api/FirebaseApi';
import { maybeLog, convertRangeToDates } from '../utils';
import { OrgType } from '../typings/models/OrgType';
import InternalAccountApi, { InternalAccountApiType, SaveUserDetailsType } from './InternalAccountApi';
//@ts-ignore
import { default as ftch } from '../utils/Fetch';
import { ExternalSyncStatusComplete, ExternalSyncStatusType } from '../typings/api/ExternalServiceApi';



type Snapshot = RNFirebase.firestore.QuerySnapshot;

const timeout = 1000 * 15; //15 seconds


/**
 * MyWellApi is the MyWell variant of the BaseApi
 * 
 * 
 */
//@ts-ignore
export default class MyWellApi implements BaseApi, UserApi, InternalAccountApi {
  orgId: string
  networkApi: NetworkApi;
  baseUrl: string;
  pendingReadingsSubscription: any;
  internalAccountApiType: InternalAccountApiType.Has = InternalAccountApiType.Has;

  constructor(networkApi: NetworkApi, orgId: string, baseUrl: string) {
    this.networkApi = networkApi;
    this.orgId = orgId;
    this.baseUrl = baseUrl;
  }

  /**
   * Sign the user in anonymously with Firebase
   */
  silentSignin(): Promise<SomeResult<AnonymousUser>> {
    return FirebaseApi.signIn();
  }

  //
  // Reading API
  // 


  /**
   * saveReading
   * 
   * @description Save a reading.
   * 
   * In order to get efficent realtime updates and improve the UX for the user,
   * we always save the reading locally to the user's `pendingReadings` collection 
   * first. That also keeps things more consistent with GGMN for now.
   * 
   * The user or we can then run a sync at any stage and update the readings globally.
   * 
   * 
   * @param resourceId 
   * @param userId 
   * @param reading 
   */
  async saveReading(resourceId: string, userId: string, reading: AnyReading | PendingReading): Promise<SomeResult<SaveReadingResult>> {
    reading.type = OrgType.MYWELL;
    // const userResult = await FirebaseApi.getUser(this.orgId, userId);
    // if (userResult.type === ResultType.ERROR) {
    //   maybeLog(userResult.message);
    //   return makeError(userResult.message);
    // }


    // if (userResult.result.status !== OWUserStatus.Approved) {
    //   const saveResult = await FirebaseApi.saveReadingToUser(this.orgId, userId, reading);
    //   if (saveResult.type === ResultType.ERROR) {
    //     maybeLog(saveResult.message);
    //     return makeError(saveResult.message);
    //   }
    //   return makeSuccess<SaveReadingResult>({ requiresLogin: true, reading: saveResult.result });
    // }

    // const saveResult = await FirebaseApi.saveReading(this.orgId, userId, reading);
    const saveResult = await FirebaseApi.saveReadingPossiblyOffineToUser(this.orgId, userId, reading);
    if (saveResult.type === ResultType.ERROR) {
      maybeLog(saveResult.message);
      return makeError(saveResult.message);
    }

    // return makeSuccess<SaveReadingResult>({ requiresLogin: false, reading: saveResult.result });
    return makeSuccess<SaveReadingResult>({ requiresLogin: false });
  }

  //
  // Resource API
  //----------------------------------------------------------------------

  /**
   * Add a resource to the recently viewed list
   */
  addRecentResource(resource: AnyResource, userId: string): Promise<SomeResult<AnyResource[]>> {
    return FirebaseApi.addRecentResource(this.orgId, resource, userId);
  }

  addFavouriteResource(resource: AnyResource, userId: string): Promise<SomeResult<void>> {
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId)
      .then(() => {
        const result: SomeResult<void> = { type: ResultType.SUCCESS, result: undefined };
        return result;
      });
  }

  removeFavouriteResource(resourceId: string, userId: string): Promise<SomeResult<void>> {
    return FirebaseApi.removeFavouriteResource(this.orgId, resourceId, userId)
      .then(() => {
        const result: SomeResult<void> = { type: ResultType.SUCCESS, result: undefined };
        return result;
      });
  }

  isResourceInFavourites(resourceId: string, userId: string): Promise<boolean> {
    return FirebaseApi.isInFavourites(this.orgId, resourceId, userId);
  }

  getResources() {
    return FirebaseApi.getResourcesForOrg(this.orgId);
  }

  // //TODO: make this look for the config!
  // getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<any>> {
  //   return FirebaseApi.getResourceNearLocation(
  //     this.networkApi,
  //     this.orgId,
  //     latitude,
  //     longitude,
  //     distance,
  //   );
  // }

  async getResourcesWithinRegion(region: Region): Promise<SomeResult<AnyResource[]>> {
    //TODO: for all of the resources, also get the short Id before returning  
    const getResourcesResult = await FirebaseApi.getResourcesWithinRegion(this.orgId, region);
    if (getResourcesResult.type === ResultType.ERROR) {
      return getResourcesResult;
    }

    return getResourcesResult;
    //TODO: "warm up" the shortId cache
  }

  /**
   * getResource
   * 
   * Get the resource given a resource id
   */
  getResource(id: string): Promise<SomeResult<AnyResource>> {
    //Also get shortId
    return FirebaseApi.getResourceForId(this.orgId, id);
  }

  /**
   * saveResource
   * 
   * Always saves the resource to the user's pendingResources. This allows us to easily get the offline features
   * working, and keeps things more similar to GGMN.
   */
  async saveResource(userId: string, resource: AnyResource): Promise<SomeResult<SaveResourceResult>> {
    resource.type = OrgType.MYWELL;
    // const userResult = await FirebaseApi.getUser(this.orgId, userId);
    // if (userResult.type === ResultType.ERROR) {
    //   maybeLog(userResult.message);
    //   return makeError(userResult.message);
    // }

    // if (userResult.result.status !== OWUserStatus.Approved) {
      const saveResult = await FirebaseApi.saveResourceToUser(this.orgId, userId, resource);
      if (saveResult.type === ResultType.ERROR) {
        maybeLog(saveResult.message);
        return makeError(saveResult.message);
      }

      //TODO: We need to update this flag for the offline features etc.
      return makeSuccess({requiresLogin: true});
    // }

    // const saveResult = await FirebaseApi.saveResource(this.orgId, userId, resource);
    // if (saveResult.type === ResultType.ERROR) {
    //   maybeLog(saveResult.message);
    //   return makeError('Could not save resource');
    // }

    // return makeSuccess({requiresLogin: false});
  }

  /**
   * Delete pending resource
   * 
   * Returns immediately as it needs to work offline
   */
  deletePendingResource(userId: string, pendingResourceId: string): Promise<SomeResult<void>> {
    FirebaseApi.deletePendingResource(this.orgId, userId, pendingResourceId);
    FirebaseApi.deletePendingReadingsForResource(this.orgId, userId, pendingResourceId);

    return Promise.resolve(makeSuccess(undefined));
  }

  /**
   * GetShortId
   * 
   * MyWell uses the default firebase implementation. 
   * 
   */
  async getShortId(resourceId: string): Promise<SomeResult<string>> {
    //TODO: implement some hefty caching

    const getShortIdResult = await FirebaseApi.getShortId(this.orgId, resourceId);
    //If we don't have a ShortId, create a new one.
    if (getShortIdResult.type === ResultType.ERROR) {
      //TODO: should this have another result type?

      return FirebaseApi.createShortId(this.orgId, resourceId);
    }

    return getShortIdResult;
  }

  /**
  * PreloadShortIds
  * 
  * Given an array of long ids, optimistically load short ids. If there are new ids, they
  * will be created
  * 
  */
  async preloadShortIds(ids: string[]): Promise<SomeResult<string[]>> {
    const MAX_SHORT_IDS = 100;
    if (ids.length > MAX_SHORT_IDS) {
      ids.length = MAX_SHORT_IDS;
    }
    //TD tech debt - find a better way to create things in arrays
    const getShortIdResults = await Promise.all(ids.map(id => this.getShortId(id)));
    const hasError = resultsHasError(getShortIdResults);
    if (hasError) {
      return makeError('Error loading shortIds');
    }

    //@ts-ignore - we already checked for failure cases above
    const shortIds: string[] = getShortIdResults.map(r => r.type === ResultType.SUCCESS && r.result);
    return makeSuccess(shortIds);
  }


  /**
   * RunInternalSync
   *
   * Run a sync where we save Resources and Readings from the user's private collections to
   * the public. For now, this will call the Firebase Admin API endpoint.
   * 
   * In the future, we can refactor this to use the common FirebaseApi
   *
   *
   * @param userId
   */
  runInternalSync(userId: string): Promise<SomeResult<ExternalSyncStatusComplete>> {
    const syncUrl = `${this.baseUrl}/admin/${this.orgId}/${userId}/sync`;
    const options = {
      timeout,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    console.log("syncURL is", syncUrl);

    return ftch(syncUrl, options)
      .then(() => makeSuccess({ 
        status: ExternalSyncStatusType.COMPLETE,
        pendingResourcesResults: [],
        pendingReadingsResults: [],
        newResources: [],
      }))
      .catch((err: Error) => makeError<ExternalSyncStatusComplete>(err.message + err.stack))
  }

  //
  // Reading API
  //----------------------------------------------------------------

  /**
   * Get the readings for a given timeseries. Timeseries is a concept borrowed from GGMN,
   * and a unique for a series of readings
   */
  async getReadingsForTimeseries(resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange): Promise<AnyReading[]> {
    const result = await FirebaseApi.getReadings(this.orgId, resourceId, timeseriesName, range);
    if (result.type === ResultType.ERROR) {
      return Promise.reject(new Error(result.message));
    }

    return result.result;
  }

  deletePendingReading(userId: string, pendingReadingId: string): Promise<SomeResult<void>> {
    FirebaseApi.deletePendingReading(this.orgId, userId, pendingReadingId);

    return Promise.resolve(makeSuccess(undefined));
  }

  
  //
  // Subscriptions
  //----------------------------------------------------------------

  subscribeToPendingReadings(userId: string, callback: (resources: PendingReading[]) => void): () => void {
    return FirebaseApi.listenForPendingReadingsToUser(this.orgId, userId, callback);
  }

  subscribeToPendingResources(userId: string, callback: (resources: PendingResource[]) => void): () => void {
    return FirebaseApi.listenForPendingResourcesToUser(this.orgId, userId, callback);
  }

  //
  // Search API
  //----------------------------------------------------------------------

  /**
   * Get the most recent resources, courtesy of the firebase api
   */
  getRecentSearches(userId: string): Promise<string[]> {
    return Promise.resolve(['1', '2']);
    // return FirebaseApi.getRecentSearches(this.orgId, userId);
  }

  /**
   * we use the firebase api to save, as this is a user setting
   */
  saveRecentSearch(userId: string, searchQuery: string): Promise<any> {
    return FirebaseApi.saveRecentSearch(this.orgId, userId, searchQuery);
  }

  /**
   * Peform the search with the firebase api
   * TODO: implement a better search api - will require an endpoint methinks
   */
  async performSearch(searchQuery: string): Promise<SomeResult<SearchResult>> {
    return makeError<SearchResult>("Search hasn't been implement yet.");
  }

  //
  // UserApi
  //----------------------------------------------------------------------

  getUser(userId: string): Promise<SomeResult<OWUser>> {
    return FirebaseApi.getUser(this.orgId, userId);
  }

  changeTranslation(userId: string, translation: TranslationEnum): Promise<SomeResult<void>> {
    return FirebaseApi.changeUserTranslation(this.orgId, userId, translation);
  }

  /**
 * A listener function which combines callback events from the FirebaseApi and 
 * GGMN api to inform the PendingChangesBanner of any updates it needs to make
 * 
 * @returns unsubscribe function
 */
  subscribeToUser(userId: string, callback: any): () => void {
    return FirebaseApi.listenForUpdatedUser(this.orgId, userId, (sn: Snapshot) => callback(sn));
  }

  onAuthStateChanged(listener: (user: RNFirebase.User) => void): () => void {
    return FirebaseApi.onAuthStateChanged(listener);
  }

  saveUserDetails(userId: string, userDetails: SaveUserDetailsType): Promise<SomeResult<void>> {
    return FirebaseApi.saveUserDetails(this.orgId, userId, userDetails);
  }

  //
  // InternalAccountApi
  //----------------------------------------------------------------------

  sendVerifyCode(mobile: string): Promise<SomeResult<RNFirebase.ConfirmationResult>> {
    return FirebaseApi.sendVerifyCode(mobile);
  }

  verifyCodeAndLogin(confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string): Promise<SomeResult<FullUser>> {
    return FirebaseApi.verifyCodeAndLogin(this.orgId, confirmResult, code, oldUserId);
  }

  logout(): Promise<SomeResult<any>> {
    return FirebaseApi.logout(this.orgId);
  }
}