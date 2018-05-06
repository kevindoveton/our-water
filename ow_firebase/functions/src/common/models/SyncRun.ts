import * as moment from 'moment';
// const moment = require('moment');

import { SyncRunStatus } from "../enums/SyncRunStatus";
import { SyncMethod } from "../enums/SyncMethod";
import { Sync } from './Sync';

/**
 * A Sync run is a single run of a single sync method.
 * When a sync is triggered, a run is created.
 * 
 * Runs start in a `pending` state, when it is running, it will move 
 * to a `running` status,  and then move to `error` or `success`
 * SyncRuns will eventually have subscribers which are notified
 * when a run fails or succeeds for any reason.
 * 
 * For now, we will just log to console when this happens
 * 
 */

export class SyncRun {
  id: string
  syncId: string
  // we need a sync method + sync verb maybe...
  syncMethod: SyncMethod
  orgId: string
  startedAt: number = 0  //unix timestamp
  finishedAt: number = 0 //unix timestamp
  subscribers: Array<string> //array of subscriber ids, which may refer to email addresses, slack ids
  status: SyncRunStatus = SyncRunStatus.pending
  results: Array<string> = []
  errors: Array<string> = []


  //TODO: constructor or builder

  /**
   * Run the syncRun
   * @param param0 
   */
  public async run({fs}) {
    if (this.status !== SyncRunStatus.pending) {
      throw new Error(`SyncRun can only be run when in a pending state. Found state: ${this.status}`);
    }

    this.startedAt = moment().unix();
    this.status = SyncRunStatus.running;
    const sync: Sync = await Sync.getSync({orgId: this.orgId, id: this.syncId, fs });

    if (!sync) {
      this.errors.push(`Could not find sync with SyncId: ${this.syncId}`);
      return this.abortSync({fs});
    }
    
    //set the state to running
    await this.save({fs});

    switch(this.syncMethod) {

      //call the datasource methods, but don't commit anything to the database
      case SyncMethod.validate:
        try {
          const result = await sync.datasource.pullDataFromDataSource();
          this.results.push(result);

        } catch (error) {
          console.log('error', error);
          this.errors.push(error);
        }

        try {
          const result = await sync.datasource.pushDataToDataSource();
          this.results.push(result);

        } catch (error) {
          console.log('error', error);
          this.errors.push(error);
        }
      break;

      //Pull from the external datasource, and save to db
      case SyncMethod.pullFrom:
        try {
          //TODO: first get some data to push...
          const result = await sync.datasource.pullDataFromDataSource();
          //TODO: do something with this result
          this.results.push(result);
        } catch (error) {
          console.log('error', error);
          this.errors.push(error);
        }
      break;

      //Get data from somewhere, and push to external datasource
      case SyncMethod.pushTo:
        try {
          //TODO: first get some data to push...
          const result = await sync.datasource.pushDataToDataSource();
          this.results.push(result);
        } catch (error) {
          console.log('error', error);
          this.errors.push(error);
        }
      break;

      default:
        console.error("Other SyncMethods not implemented yet.");
    }

    //TODO: we need to somehow update the Sync with the last sync date,
    //But I think that we need to keep track of separate dates depending on the
    //method used. We will leave that for later.


    if (this.errors.length > 0) {
      return this.abortSync;
    }

    return this.finishSync({fs});
  }

  private async abortSync({fs}) {
    this.status = SyncRunStatus.failed;
    this.finishedAt = moment().unix();

    return this.save({fs});
  }

  private async finishSync({fs}) {
    this.status = SyncRunStatus.finished;
    this.finishedAt = moment().unix();

    return this.save({fs});
  }

  /**
   * Create a new sync in FireStore
   */
  public create({fs}) {
    return fs.collection('org').doc(this.orgId)
      .collection('syncRun').add(this);
  }
  
  public save({fs}) {
    //TODO: does this merge?
    return fs.collection('org').doc(this.orgId)
      .collection('syncRun').doc(this.id).save(this);
  }

  /**
   * Get the sync run for the given id
   * @param param0 
   */
  static getSyncRun({orgId, id, fs}) {
    return fs.collection('org').doc(orgId).collection('syncRun').doc(id);
    //TODO: deserialize into actual SyncRun object
  }


}