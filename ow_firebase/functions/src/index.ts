import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
admin.initializeApp();

//Org Api
export const org = require('./fn_org/org')(functions, admin);

//Group Api
export const group = require('./fn_group/group')(functions, admin);

//Resource Api
export const resource = require('./fn_resource/resource')(functions, admin);

//Reading Api
export const reading = require('./fn_reading/reading')(functions, admin);

//Sync Api
export const sync = require('./fn_sync/sync')(functions, admin);



//TODO: move these functions to new doc

const fs = admin.firestore();

/**
 * Add metadata to readings when created
 */
export const copyResourceFields = functions.firestore
  .document('org/{orgId}/{reading}/{readingId}')
  .onCreate((snapshot, context) => {
    //Get the corresponding resource
    const {orgId, readingId} = context.params;
    const newReading = snapshot.data();
    const resourceId = newReading.resourceId;

    return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).get()
    .then(doc => {
      const data = doc.data();

      return {
        //TODO: double check format
        coords: data.coords,
        groups: data.groups,
      };
    })
    .then(readingMetadata => fs.collection('org').doc(orgId)
                               .collection('reading').doc(readingId).update(readingMetadata))
    .then(() => console.log(`added metadata to /org/${orgId}/reading/${readingId}`))
  });


/**
 * Update the last value on resource when there is a new reading
 * 
 * when doing bulk uploads, add a field: `isLegacy:true` to the readings, which will bypass this function
 */
export const updateLastValue = functions.firestore
.document('org/{orgId}/{reading}/{readingId}')
.onCreate((snapshot, context) => {
  //Get the corresponding resource
  const { orgId, resourceId, readingId } = context.params;
  const newReading = snapshot.data();

  //If this reading is a legacyReading, then don't update
  if (newReading.isLegacy === true) {
    console.log("reading marked as legacy reading. Not updating");
    return;
  }

  return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).get()
    .then(doc => {
      const res = doc.data();

      if (res.lastReadingDatetime 
        && res.lastReadingDatetime > newReading.datetime) {
        console.log(`newer reading for /org/${orgId}/resource/${resourceId} already exists`);
        return true;
      }

      const latestReadingMetadata = {
        lastReadingDatetime: newReading.datetime,
        lastValue: newReading.value,
      };
      return fs.collection('org').doc(orgId).collection('resource').doc(resourceId).update(latestReadingMetadata);
    });
});


/*

  TODO: watches for syncs

  - when a new resource is created, lookup the necessary syncs, and call `push` for each relevant one
  - when a new reading is created, lookup the necessary syncs, and call `push` for each relevant one

*/

/*

TODO: watches for SyncRuns:

- when a SyncRun changes state to success, update the Sync lastRunDate
- when a SyncRun changes state to failed, send error to subscribers

*/




//TODO: on creation of a resource, send an email or sms
//These aren't so pressing...
//TODO: change group name, propagate to all resources and readings
//TODO: add or remove group from resource, propagate to existing readings