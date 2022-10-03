import firebaseAdmin from "firebase-admin";
// eslint-disable-next-line import/no-unresolved
import { applicationDefault } from "firebase-admin/app";

firebaseAdmin.initializeApp({
  credential: applicationDefault(),
  databaseURL: process.env.FIREBASE_DB_HOST
});

export default firebaseAdmin;
