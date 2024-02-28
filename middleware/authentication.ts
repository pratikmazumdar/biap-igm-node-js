import { Response, NextFunction, Request } from "express";
import validateToken from "../lib/firebase/validateToken";

const authentication =
  () => (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return next(
        res.status(401).send({
          status: 401,
          name: "UNAUTHENTICATED_ERROR",
          message: "Authorization header not provided",
        })
      );

    const idToken = authHeader.split(" ")[1];
    validateToken(idToken).then((decodedToken) => {
      if (decodedToken) {
        req.user = { decodedToken: decodedToken, token: idToken };
        next();
      } else {
        res.status(401).send({
          status: 401,
          name: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated",
        });
      }
    });
  };

export default authentication;
