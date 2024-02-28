import admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

const validateToken = async (token: string) => {
  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (e) {
    // Token is invalid.
    return null;
  }
};

export default validateToken;
