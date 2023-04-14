import admin from "firebase-admin";
import firebaseService from "../../config/dev/firebase-service-account.json";

const firebaseAdminObject: any = firebaseService;

const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminObject),
  });
};

export default initializeFirebase;
