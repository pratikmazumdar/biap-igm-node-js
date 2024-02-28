import { Response, NextFunction } from 'express';
import { Request } from 'interfaces/custom';
import validateToken from '../lib/firebase/validateToken';
import { DecodedIdToken } from 'firebase-admin/auth';

const authentication = () => (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return next(
      res.status(401).send({
        status: 401,
        name: 'UNAUTHENTICATED_ERROR',
        message: 'Authorization header not provided',
      }),
    );

  const idToken = authHeader.split(' ')[1];
  validateToken(idToken).then((decodedToken: DecodedIdToken | null) => {
    if (!decodedToken) {
      return res.status(401).send({
        status: 401,
        name: 'UNAUTHENTICATED_ERROR',
        message: 'Unauthenticated',
      });
    }

    req.user = { decodedToken: decodedToken, token: idToken };
    next();
  });
};

export default authentication;
