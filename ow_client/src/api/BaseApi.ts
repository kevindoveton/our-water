import { Resource, SearchResult, Reading, SaveReadingResult, OWUser, SaveResourceResult } from "../typings/models/OurWater";
import { Region } from "react-native-maps";
import { SomeResult } from "../typings/AppProviderTypes";


/**
 * BaseApi is the base API for Our Water
 */
export default interface BaseApi {
  
  //
  // Auth API
  //----------------------------------------------------------------------

  /**
   * Sign in the user sliently.
   * Most likely, this will use the FirebaseAPI behind the scenes
   */
  silentSignin(): Promise<SomeResult<string>>;


  


  //
  // Resource API
  //----------------------------------------------------------------------


  /**
   * Add a resource to the recently viewed list
   * Most likely will use Firebase
   */
  addRecentResource(resource: Resource, userId: string): Promise<SomeResult<Resource[]>>;

  /**
   * Add a resource to the favourites list
   */
  addFavouriteResource(resource: Resource, userId: string): Promise<SomeResult<void>>;

  /**
   * Remove a favourite resource from the favourites list
   */
  removeFavouriteResource(resourceId: string, userId: string): Promise<SomeResult<void>>;

  /**
   * Check if a resource is in the user's favourites
   */
  isResourceInFavourites(resourceId: string, userId: string): Promise<boolean>; 

  /**
   * Get a bunch of resources
   * No guarantee that this is all the resources
   */
  getResources(): any;


  /**
   * Get all resources close to a location.
   */
  getResourceNearLocation(
    latitude: number,
    longitude: number,
    distance: number
  ): Promise<Array<Resource>>;

  //
  // Reading API
  //----------------------------------------------------------------------

  /**
   * Get the readings for a given timeseries. Timeseries is a concept borrowed from GGMN,
   * and a unique for a series of readings
   */
  getReadingsForTimeseries(resourceId: string, timeseriesId: string, startDate: number, endDate: number): Promise<Reading[]>;

  /**
   * Save a reading
   * 
   * Returns a SomeResult which can either be a SuccessResult or ErrorResult
   */
  saveReading(resourceId: string, userId: string, reading: Reading): Promise<SomeResult<SaveReadingResult>>;

  /**
   * Save a Resource
   * 
   * Returns a Wrapped SaveResourceResult
   */
  saveResource(userId: string, resource: Resource): Promise<SomeResult<SaveResourceResult>>;


  /**
   * Subscribe to a user object, and listen for any changes
   */
  subscribeToUser(userId: string, callback: (user: OWUser) => void): string;


  /**
   * set up a listener for changes to any pending readings
   */
  subscribeToPendingReadings(userId: string, callback: (readings: Reading[]) => void): void;

  /**
   * unsubscribe from the pending reading listener
   */
  unsubscribeFromPendingReadings(subscriptionId: string): void;


  /**
   * Set up a listener for changes to pending resources
   */
  subscribeToPendingResources(userId: string, callback: (resources: Resource[]) => void): void;

  /**
   * get the pending readings for this user
   */
  getPendingReadings(userId: string): Promise<Reading[]>;

  /**
   * get the pending readings for this user and resourceId
   */
  getPendingReadingsForResourceId(userId: string, resourceId: string): Promise<Reading[]>;

  /**
   * Get the resources within a region.
   * May not necessarily return all resources if the region is too large
   */
  getResourcesWithinRegion(region: Region): Promise<SomeResult<Resource[]>>;

  /**
   * Get a resource for an id.
   */
  getResource(id: string): Promise<Resource>;


  //
  // Search API
  //----------------------------------------------------------------------

  /**
   * Get the most recent searches from the user, sorted newest to oldest
   * will limit to something like 5 searches
   */
  getRecentSearches(userId: string): Promise<string[]>;

  /**
   * Save a search to the user's recent searches
   */
  saveRecentSearch(userId: string, searchQuery: string): Promise<any>;

  /**
   * Perform a search with the given search query
   * Will return an assortment of search results
   * 
   * If the user is currently offline, API will still try and complete
   * the search if possible.
   */
  performSearch(searchQuery: string): Promise<SearchResult>;
}