import { Response, NextFunction } from "express";
import { Authorisation } from "../lib/authorisation";

const authorisation =
  (options: any) => (req: any, res: Response, next: NextFunction) => {
    const httpRequestMethod = req.method.toUpperCase();
    const authorisation = new Authorisation(
      req.user,
      httpRequestMethod,
      options.resource,
      options.roles
    );

    // If user is allowed to access given resource then moved to next function else forbid
    authorisation
      .isAllowed()
      .then((permission) => {
        req.permission = permission;
        next();
      })
      .catch(() => {
        res.status(403).send();
      });
  };

export default authorisation;
