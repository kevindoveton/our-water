import BaseApi from "./BaseApi";
import NetworkApi from "./NetworkApi";
import { Firebase } from "react-native-firebase";
import FirebaseApi from "./FirebaseApi";
//@ts-ignore
import { default as ftch } from 'react-native-fetch-polyfill';
import { appendUrlParameters, parseFetchResponse, getDemoResources } from "../utils";
import { GGMNLocationResponse, GGMNLocation } from "../typings/models/GGMN";
import { isMoment } from "moment";
import { Resource, SearchResult } from "../typings/models/OurWater";
import { ResourceType } from "../enums";
import ExternalServiceApi from "./ExternalServiceApi";

// TODO: make configurable
const timeout = 1000 * 10;

export interface GGMNApiOptions {
  baseUrl: string,
  auth?: any,
}

/**
 * The GGMN Api.
 * 
 * TODO: make an interface, and share components with BaseApi.js
 */
class GGMNApi implements BaseApi, ExternalServiceApi {
  auth: any = null;
  baseUrl: string;
  networkApi: NetworkApi;
  orgId: string;

  /**
   * initialize with options
   * 
   * If options.auth is present then the user will be considered logged in
   * TODO: how to we pass this in with 
   */
  constructor(networkApi: NetworkApi, orgId: string, options: GGMNApiOptions) {
    this.baseUrl = options.baseUrl;
    if (options.auth) {
      this.auth = options.auth;
    }

    this.networkApi = networkApi;
    this.orgId = orgId;
  }

  //
  // Auth API
  //----------------------------------------------------------------------

  /**
   * Sign the user in anonymously with Firebase
   */
  silentSignin(): Promise<any> {
    return FirebaseApi.signIn();
  }

  /**
  * Connect to an external service.
  * 
  * Optional implementation
  */
  connectToService(): Promise<any> {
    return Promise.resolve(null);
  }

  /**
   * Save the external service details to firebase, securely
   * 
   * Optional implementation
   */
  saveExternalServiceLoginDetails(): Promise<any> {
    return Promise.resolve(null);
  }

  getExternalServiceLoginDetails(): Promise<any> {
    return Promise.resolve(null);
  }

  /**
   * Add a resource to the recently viewed list
   */
  addRecentResource(resource: Resource, userId: string): Promise<any> {
    return FirebaseApi.addRecentResource(this.orgId, resource, userId);
  }

  addFavouriteResource(resource: Resource, userId: string): Promise<any> {
    return FirebaseApi.addFavouriteResource(this.orgId, resource, userId);
  }


  /**
   * GET resources
   * 
   * Gets the resources and recent readings from GGMN api.
   * TODO: figure out pagination and whatnot!
   * Maybe we can sort by updatedAt
   */
  getResources(): Promise<Array<Resource>> {
    const resourceUrl = `${this.baseUrl}/v3/locations/`;
    const url = appendUrlParameters(resourceUrl, {
      // page: 0,
      page_size: 100,
    });
    console.log("URL is", url);
    
    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return ftch(url, options)
    .then((response: any) => parseFetchResponse<GGMNLocationResponse>(response))
    .then((response: GGMNLocationResponse) => {
      console.log("response", response);
      //TODO: finish getting the resources
      return response.results.map(from => GGMNApi.ggmnLocationToResource(from));
    });
  }


  getResourceNearLocation(latitude: number, longitude: number, distance: number): Promise<Array<Resource>> {
    const realDistance = distance * 1000000; //not sure what units distance is in
    const resourceUrl = `${this.baseUrl}/v3/locations/`;
    const url = appendUrlParameters(resourceUrl, {
      dist: realDistance,
      point: `${longitude},${latitude}`
    });
    console.log("URL is", url);

    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return ftch(url, options)
      .then((response: any) => parseFetchResponse<GGMNLocationResponse>(response))
      .then((response: GGMNLocationResponse) => {
        console.log("response", response);
        //TODO: finish getting the resources
        return response.results.map(from => GGMNApi.ggmnLocationToResource(from));
      });
  }

  //
  // Search API
  //----------------------------------------------------------------------

  /**
   * Get the most recent resources, courtesy of the firebase api
   */
  getRecentSearches(userId: string): Promise<string[]> {
    return FirebaseApi.getRecentSearches(this.orgId, userId);
  }

  /**
   * we use the firebase api to save, as this is a user setting
   */
  saveRecentSearch(userId: string, searchQuery: string): Promise<any> {
    return FirebaseApi.saveRecentSearch(this.orgId, userId, searchQuery);
  }

  performSearch(searchQuery: string): Promise<SearchResult> {
    //TODO: implement search for offline mode
    return Promise.resolve({
      resources: getDemoResources(),
      groups:[],
      users: [],
      offline: false,
    });
  }

  //
  // Utils
  //----------------------------------------------------------------------

  static ggmnLocationToResource(from: GGMNLocation): Resource {
    const to: Resource = {
      id: `ggmn_${from.id}`,
      legacyId: `ggmn_${from.id}`,
      groups: null,
      lastValue: 0,
      resourceType: ResourceType.well,
      lastReadingDatetime: new Date(),
      coords: {
        _latitude: from.geometry.coordinates[1],
        _longitude: from.geometry.coordinates[0],
      },
      owner: {
        name: from.organisation.name,
      }
    };

    return to;
  }
}

export default GGMNApi;