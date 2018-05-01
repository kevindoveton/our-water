import firebase from 'react-native-firebase';
import { default as ftch } from 'react-native-fetch-polyfill';

import { 
  appendUrlParameters, 
  rejectRequestWithError 
} from '../utils';
import Config from 'react-native-config';

const fs = firebase.firestore();
const baseUrl = Config.REACT_APP_BASE_URL;

const timeout = 1000 * 10;

class FirebaseApi {

  static getResourcesForOrg({ orgId }) {
    console.log('id is', orgId);
    return fs.collection('org').doc(orgId).collection('resource').get()
      .then(sn => {
        const resources = [];
        sn.forEach((doc) => {
          //Get each document, put in the id
          const data = doc.data();
          data.id = doc.id;
          resources.push(data);
        });

        return resources;
      });
  }

  /**
   * functions.httpsCallable is not yet available for react-native-firebase
   * instead, we can just use fetch
   * 
   * @param {*} param0 
   */
  static getResourceNearLocation({orgId, latitude, longitude, distance}) {
    console.log("HELLO");

    const resourceUrl = `${baseUrl}/${orgId}/nearLocation`;
    const url = appendUrlParameters(resourceUrl, {latitude, longitude, distance});
    // const call = functions
    //   .httpsCallable(`resource/${orgId}/nearLocation?latitude=${latitude}&longitude=${longitude}&distance=${distance}`);
    
    // return call();
    const options = {
      timeout,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return ftch(url, options)
      .then(response => {
        if (!response.ok) {
          console.log(response._bodyText);
          return rejectRequestWithError(response.status);
        }

        return response.json();
      })
      .then(body => { 
        console.log(body);
      });
  }

  static createNewResource({ orgId, resourceData }) {
    const resource = functions.httpsCallable(`resource/${orgId}`);

    //TODO: cors, figure out how to set the path here.
    return resource(resourceData)
      .then(result => {
        // Read result of the Cloud Function.
      })
  };
}

export default FirebaseApi;