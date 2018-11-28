const admin = require('firebase-admin');


/* Not in git. Download from FB console*/
const serviceAccount = require('./.serviceAccountKey.json');

let firestore;

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: databaseUrl,
    // storageBucket,
  });
  firestore = admin.firestore();
  const settings = { timestampsInSnapshots: true };
  console.log("TestFirebase calling firestore.settings");
  firestore.settings(settings);
}

const auth = admin.auth();
if (!firestore) {
  firestore = admin.firestore();
}


export {
  admin,
  auth,
  firestore,
}