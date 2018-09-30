import { Alert } from 'react-native';
import * as React from 'react';
import * as moment from 'moment';
import QueryString, { stringify } from 'query-string';
import { textDark, bgDark2, bgLight, primaryLight } from './Colors';
import { Location, LocationType } from '../typings/Location';
import { Resource, BasicCoords, TimeseriesRange, Reading, TimeseriesRangeReadings } from '../typings/models/OurWater';
import { ResourceType } from '../enums';
import { Region } from 'react-native-maps';
import { Avatar } from 'react-native-elements';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';


/**
 * Convert a region to a bounding box
 */
export function calculateBBox(region: Region){
  return [
    region.longitude - region.longitudeDelta, // westLng - min lng
    region.latitude - region.latitudeDelta, // southLat - min lat
    region.longitude + region.longitudeDelta, // eastLng - max lng
    region.latitude + region.latitudeDelta// northLat - max lat
  ];
}

/**
 * Naively Parse the response from Fetch api, and handle errors etc.
 * Use this for small requests with well formed responses. Otherwise you 
 * may have to do it manually.
 */
export function deprecated_naiveParseFetchResponse<T>(response: any): Promise<T> {
  if (!response.ok) {
    return rejectRequestWithError(response.status);
  }

  return response.json();
}

export async function naiveParseFetchResponse<T>(response: any): Promise<SomeResult<T>> {
  console.log('naiveParseFetchResponse', response);
  if (!response.ok) {
    return {
      type: ResultType.ERROR,
      message: 'Network request failed',
    };
  }

  let parsed: T;
  try {
    parsed = await response.json();
  } catch (err) {
    return {
      type: ResultType.ERROR,
      message: 'Error deserializing json from response.',
    }
  }

  return {
    type: ResultType.SUCCESS,
    result: parsed,
  };
}

/**
 * Get the image based on the resource type
 */
export function imageForResourceType(type: ResourceType) {
  switch (type) {
    case ResourceType.checkdam:
      return require('../assets/checkdam_pin.png');
    case ResourceType.raingauge:
      return require('../assets/raingauge_pin.png');
    case ResourceType.well:
      return require('../assets/well_pin.png');
    case ResourceType.custom:
      return require('../assets/other_pin.png')
  }
}

/**
 * Get a unique hash based on the resourceId, pincode, and date
 */
/* tslint:disable-next-line */
export const getHashForReading = (reading: any) => {
  return `r:${reading.date}|${reading.resourceId}|${reading.pincode}`;
}

export const rejectRequestWithError = (status: number) => {
  const error: any = new Error(`Request failed with status ${status}`);
  error['status'] = status;
  return Promise.reject(error);
}

export const showAlert = (title: string, message: string) => {
  Alert.alert(title, message,
    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
    { cancelable: false }
  );
}

export const appendUrlParameters = (url: string, qs: any) => {
  return `${url}?${stringify(qs)}`;
}

export const formatCoords = (fbCoords: any) => {
  return {
    latitude: fbCoords._latitude,
    longitude: fbCoords._longitude,
  };
}

export const getLocation = (): Promise<SomeResult<Location>> => {
  return new Promise((resolve, reject) => {
    return navigator.geolocation.getCurrentPosition(
      (p: Position) => {
        const location: Location = {
          type: LocationType.LOCATION,
          coords: p.coords,
        }
        resolve({type: ResultType.SUCCESS, result: location});
      },
      (err: any) => (reject({type: ResultType.ERROR, message: 'Error loading location.'})),
      {timeout: 5000}
    );
  });
}

export const pinColorForResourceType = (resourceType: any) => {
  switch(resourceType) {
    case 'well':
      return "#2CCCE4";
    case 'raingauge':
      return "#37D67A";
    case 'checkdam':
      return "#FF6767";
  }
}

export const getSelectedResourceFromCoords = (resources: Resource[], coords: BasicCoords): Resource | null => {
  console.log("coords are", coords);
  console.log("resources length is: ", resources.length);

  const filtered = resources.filter((res: any) => {
    return coords.latitude === res.coords._latitude && 
      coords.longitude === res.coords._longitude;
  });

  if (filtered.length === 0) {
    console.warn("Could not find any resource at coords");
    return null;
  }

  if (filtered.length > 1) {
    console.warn("Found more than 1 resource for coords. returning just the first");
  }

  return filtered[0];
}

export const navigateTo = (props: any, screen: any, title: any, passProps: any, animationType = 'slide-horizontal') => {
  //TODO: only navigate if we aren't already here!

  props.navigator.toggleDrawer({
    side: 'left', // the side of the drawer since you can have two, 'left' / 'right'
    animated: true, // does the toggle have transition animation or does it happen immediately (optional)
    to: 'closed' // optional, 'open' = open the drawer, 'closed' = close it, missing = the opposite of current state
  });

  props.navigator.push({
    screen,
    title,
    passProps,
    navigatorStyle: defaultNavigatorStyle,
    navigatorButtons: {}, // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
    animationType
  });
}

export const showModal = (props: any, screen: any, title: any, passProps: any) => {
  //TODO: only navigate if we aren't already here!

  props.navigator.toggleDrawer({
    side: 'left', // the side of the drawer since you can have two, 'left' / 'right'
    animated: true, // does the toggle have transition animation or does it happen immediately (optional)
    to: 'closed' // optional, 'open' = open the drawer, 'closed' = close it, missing = the opposite of current state
  });

  // TODO: change left arrow to just x
  props.navigator.showModal({
    screen,
    title,
    passProps,
    navigatorStyle: defaultNavigatorStyle,
  });
}

export const getMinAndMaxReadingDates = (momentFormat: string): {minDate: string, maxDate: string} => {
  const today = moment();
  const twoWeeksAgo = moment().subtract(14, 'days');

  return {
    minDate: twoWeeksAgo.format(momentFormat),
    maxDate: today.format(momentFormat),
  }
}

export const displayAlert = (title: string, message: string, buttons: any) => {
  Alert.alert(title, message, buttons,
    { cancelable: false }
  );
}

/**
 * Create a bounding box from lat, lng and distance multiplier
 * distance must be a float between 0-1
 * @param {*} param0 
 */
export const boundingBoxForCoords = (latitude: number, longitude: number , distance: number) => {
  if (distance < 0 || distance > 1) {
    throw new Error("Distance must be a float between 0 and 1");
  }

  const distanceMultiplier = 100; //TODO: tune this value based on the queries we are getting back once we can see it a map
  const minLat = latitude - distanceMultiplier * distance;
  const minLng = longitude - distanceMultiplier * distance;
  const maxLat = latitude + distanceMultiplier * distance;
  const maxLng = longitude + distanceMultiplier * distance;

  return {
    minLat, minLng, maxLat, maxLng
  };
}

export  const prettyColors = [
  "#d1c4e9",
  "#e1bee7",
  "#c5cae9",
  "#b2dfdb",
  "#c8e6c9",
  "#dcedc8",
  "#f0f4c3",
  "#fff9c4",
];

export const randomPrettyColorForId = (resourceId: string) => {
  const idNumber = Math.abs(hashCode(resourceId))
  const index = (idNumber % prettyColors.length);

  return prettyColors[index];
}

export  const hashCode = (str: string) => {
  var hash = 0;
  if (str.length === 0) return hash;
  let i: number;
  for (i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Get the short id.
 * This will have to account for different coding schemes
 */
export const getShortId = (str: string): string => {
  // return Math.abs(hashCode(str));
  return str;
}

export const defaultNavigatorStyle = {
  navBarHidden: false,
  navBarTextColor: textDark, // change the text color of the title (remembered across pushes)
  navBarBackgroundColor: bgLight,
  statusBarColor: bgLight,
  statusBarTextColorScheme: 'dark',
  screenBackgroundColor: bgLight,
  //Bottom nav bar, android only
  navigationBarColor: bgDark2,
}

export function getDemoResources(count: number): Resource[] {
  const resources: Resource[] = [];

  for (let i = 0; i <= count; i++) {
    const id = 1 + i;
    resources.push({
      id: `${id}`,
      legacyId: `${id}`,
      coords: {
        _latitude: -20.401,
        _longitude: 32.3373
      },
      resourceType: ResourceType.well,
      owner: {
        name: 'Lewis Ji',
      },
      groups: null,
      lastValue: 12.34,
      lastReadingDatetime: new Date(),
      timeseries: [],
    })
  }

  return resources;
}

export function getGroundwaterAvatar() {
  return (
    <Avatar
      containerStyle={{
        backgroundColor: primaryLight,
        alignSelf: 'center',
      }}
      rounded
      // size="large"
      title = "GW"
      activeOpacity = { 0.7}
    />
  );
}

export function getReadingAvatar() {
  return (
    <Avatar
      containerStyle={{
        backgroundColor: primaryLight,
        alignSelf: 'center',
      }}
      rounded
      // size="large"
      title = "R"
      activeOpacity = { 0.7}
    />
  );
}

/**
   * Iterate through favourite resources, and find out
   * if this is in the list
   */
export function isFavourite(favouriteResources: Resource[], resourceId: string) {
  // const { favouriteResources, resource: { id } } = this.props;

  const ids = favouriteResources.map(r => r.id);
  if (ids.indexOf(resourceId) > -1) {
    return true;
  }

  return false;
}

/**
 * Convert a TimeseriesRange into unix typestamp start and end dates
 */
export function convertRangeToDates(range: TimeseriesRange): { startDate: number, endDate: number } {
  //TODO: parse dates etc.
  return {
    startDate: moment().subtract(1, 'year').valueOf(),
    endDate: moment().valueOf(),
  }
}


/**
 * Initialize an empty Timeseries range reading
 */
export function newTsRangeReadings(): TimeseriesRangeReadings {
  return {
    ONE_YEAR: { meta: { loading: false }, readings: [] },
    THREE_MONTHS: { meta: { loading: false }, readings: [] },
    TWO_WEEKS: { meta: { loading: false }, readings: [] },
    EXTENT: { meta: { loading: false }, readings: [] },
  }
}

/**
 * Helper function to modify deeply nested data inside the metadata for a 
 * timeseries range reading
 */
export function setLoading(timeseriesReadings: Map<string, TimeseriesRangeReadings>, timeseriesId: string, range: TimeseriesRange, loading: boolean) {
  //Set the appropriate meta to loading for the timeseries and timerange
  let tsRangeReadings = timeseriesReadings.get(timeseriesId);
  if (!tsRangeReadings) {
    tsRangeReadings = newTsRangeReadings();
  }
  const readingsForRange = tsRangeReadings[range];
  readingsForRange.meta = { loading };

  console.log('readingsForRange', readingsForRange);

  tsRangeReadings[range] = readingsForRange;
  timeseriesReadings.set(timeseriesId, tsRangeReadings);

  return timeseriesReadings;
}

export function addReadingsAndStopLoading(readings: Reading[], timeseriesReadings: Map<string, TimeseriesRangeReadings>, timeseriesId: string, range: TimeseriesRange) {
  //Set the appropriate meta to loading for the timeseries and timerange
  let tsRangeReadings = timeseriesReadings.get(timeseriesId);
  if (!tsRangeReadings) {
    tsRangeReadings = newTsRangeReadings();
  }
  const readingsForRange = tsRangeReadings[range];
  readingsForRange.meta = { loading: false };
  readingsForRange.readings = readings,

  tsRangeReadings[range] = readingsForRange;
  timeseriesReadings.set(timeseriesId, tsRangeReadings);

  return timeseriesReadings;
}


export function getTimeseriesReadingKey(timeseriesId: string, range: TimeseriesRange): string {
  return `${timeseriesId}+${range}`;
}



/**
 * A simple throttle function
 * @param delay delay time in ms
 * @param cb the original function
 */
export function throttled(delay: number, cb: any) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return cb(...args);
  }
}

// ES6
export function debounced(delay: number, fn: any) {
  let timerId: any;
  return function (...args: any[]) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  }
}
