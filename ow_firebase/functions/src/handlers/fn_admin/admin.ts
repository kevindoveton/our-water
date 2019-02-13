import * as validate from 'express-validation';
import * as express from 'express';
import * as cors from 'cors';
import ErrorHandler from '../../common/ErrorHandler';


//@ts-ignore
import * as morgan from 'morgan';
//@ts-ignore
import * as morganBody from 'morgan-body';
import { validateFirebaseIdToken } from '../../middleware';
import { generateQRCode } from '../../common/apis/QRCode';
import { writeFileAsync } from '../../common/utils';
import FirebaseApi from '../../common/apis/FirebaseApi';
import { firestore } from '../../common/apis/FirebaseAdmin';
import { ResultType } from 'ow_common/lib/utils/AppProviderTypes';
import { UserApi } from 'ow_common/lib/api';
import UserType from 'ow_common/lib/enums/UserType';
import UserStatus from 'ow_common/lib/enums/UserStatus';


const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin')
require('express-async-errors');

module.exports = (functions) => {
  const app = express();
  app.use(bodyParser.json());

  if (process.env.VERBOSE_LOG === 'false') {
    console.log('Using simple log');
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  } else {
    console.log('Using verbose log');
    morganBody(app);
  }

  app.use(validateFirebaseIdToken);

  //TODO: figure out how to ensure calling user is Admin?


  /**
   * ChangeUserStatus
   * PATCH /:orgId/:userId/status
   * 
   * Change the user's status to either Approved or Rejected.
   * If ther user's new status is 'Approved', and has pending resources or readings, they will be saved and deleted
   */
  const changeUserStatusValidation = {
    options: {
      allowUnknownBody: false,
    },
    body: {
      status: Joi.string().valid(UserStatus.Approved, UserStatus.Rejected),
    },
  }

  app.patch('/:orgId/:userId/status', validate(changeUserStatusValidation), async (req, res) => {
    const { orgId, userId } = req.params;
    const { status } = req.body;
    const fbApi = new FirebaseApi(firestore);
    const userApi = new UserApi(firestore, orgId);


    //TODO: how to make sure only Admin can call this endpoint? 
    //Can we add that as a rule to the Firestore rules?

    const statusResult = await userApi.changeUserStatus(userId, status);
    if (statusResult.type === ResultType.ERROR) {
      throw new Error(statusResult.message);
    }

    if (status === "Approved") {
      const syncResult = await fbApi.syncPendingForUser(orgId, userId);
      if (syncResult.type === ResultType.ERROR) {
        throw new Error(syncResult.message);
      }
    }

    res.status(204).send("true");
  });

  //       status: Joi.string().valid(UserStatus.Approved, UserStatus.Rejected),

  /**
   * ChangeUserType
   * PATCH /:orgId/:userId/type
   * 
   * Change the user's type to either User or Admin
   */
  const changeUserTypeValidation = {
    options: {
      allowUnknownBody: false,
    },
    body: {
      type: Joi.string().valid(Object.keys(UserType)),
    },
  }

  app.patch('/:orgId/:userId/type', validate(changeUserTypeValidation), async (req, res) => {
    const { orgId, userId } = req.params;
    const { type } = req.body;

    //TODO: how to make sure only Admin can call this endpoint? 
    //Can we add that as a rule to the Firestore rules?
    const userApi = new UserApi(orgId, userId);

    const statusResult = await userApi.changeUserType(userId, type);
    if (statusResult.type === ResultType.ERROR) {
      throw new Error(statusResult.message);
    }

    res.status(204).send("true");
  });

  /* CORS Configuration */
  const openCors = cors({ origin: '*' });
  app.use(openCors);

  /*Error Handling - must be at bottom!*/
  app.use(ErrorHandler);

  return functions.https.onRequest(app);
};
