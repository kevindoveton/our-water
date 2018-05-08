const assert = require('assert');
const request = require('request-promise-native');
const sleep = require('thread-sleep');

const { createNewSync, getSyncRun } = require('./TestUtils');

const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;

module.exports = ({fs}) => {
  
  describe('Array', function () {
    describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function () {
        assert.equal([1, 2, 3].indexOf(4), -1);
      });
    });
  });


  describe('SyncAPI', function () {
    this.timeout(30000);

    //Objects to clean up later
    let syncIds = [];
    let syncRunIds = [];

    describe('MyWell Pull', () => {

      it('creates a new legacy sync, and pulls the data correctly', () => {

        let syncId = null;
        let syncRunId = null;

        const data = {
          isOneTime: false,
          datasource: {
            type: "LegacyMyWellDatasource",
            url: "https://mywell-server.vessels.tech",
          },
          type: "unknown",
          selectedDatatypes: [
            'group',
            'resource',
            'reading',
          ]
        };

        const createSyncOptions = {
          method: 'POST',
          uri: `${baseUrl}/sync/${orgId}`,
          json: true,
          body: {
            data
          }
        };

        return request(createSyncOptions)
          .then(response => {
            // syncIds.push(response.syncId);
            syncId = response.syncId;
            // syncIds.push(syncId);

            const runSyncOptions = {
              method: 'GET',
              uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=pullFrom`
            }

            return request(runSyncOptions);
          })
          .then(response => JSON.parse(response)) //json:true only applies to posts I think 
          .then(response => {
            //TODO: we might need to wait a little while 
            sleep(1000);

            syncRunId = response.syncRunId;
            // syncRunIds.push(syncRunId)
            return getSyncRun({orgId, fs, syncRunId});
          })
          .then(syncRun => {
            console.log('syncRun: ', syncRun);
          });
      });
    });

    it('should create a new Sync', () => {
      const data = {
        isOneTime: false,
        datasource: {
          type: "LegacyMyWellDatasource",
          url: "https://mywell-server.vessels.tech",
        },
        type: "unknown",
        selectedDatatypes: [
          'group',
          'resource',
          'reading',
        ]
      };

      const options = {
        method: 'POST',
        uri: `${baseUrl}/sync/${orgId}`,
        json: true,
        body: {
          data
        }
      };

      return request(options)
      .then(response => {
        syncIds.push(response.syncId);
      })
      .catch(err => {
        console.log('err', err);
        return Promise.reject(err);
      });
    });

    it.only('should create and run the sync', () => {

      let syncRunId = null;
      return createNewSync()
      .then(syncId => {
        syncIds.push(syncId);

        const options = {
          method: 'GET',
          uri: `${baseUrl}/sync/${orgId}/run/${syncId}?method=validate`
        };
        
        return request(options);
      })
      .then(response => JSON.parse(response)) //json:true only applies to posts I think 
      .then(response => {
        syncRunIds.push(response.syncRunId);
        syncRunId = response.syncRunId;
      })
      //Wait for the sync to finish
      .then(() => sleep(20000))
      .then(() => getSyncRun({orgId, fs, syncRunId}))
      .then(syncRun => {
        console.log("syncRun is:", syncRun);
        assert.equal(syncRun.status, 'finished');
      })
    });;

    //Cleanup all created resources
    after(function() {
      console.log("     Clean Up:");

      console.log(`      cleaning up ${syncIds.length} syncs`);
      syncIds.forEach(syncId => {
        return fs.collection('org').doc(orgId).collection('sync').doc(syncId)
          .delete();
      });

      console.log(`      cleaning up ${syncRunIds.length} syncRuns`);
      syncRunIds.forEach(syncRunId => {
        return fs.collection('org').doc(orgId).collection('syncRun').doc(syncRunId)
          .delete();
      });
    
    });
  });

}