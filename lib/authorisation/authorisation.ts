import _ from "lodash";
import { UnauthorisedError } from "../error";

class Authorisation {
  user: any;
  roles: any;
  httpRequestMethod?: any;
  resource?: any;
  constructor(user: any, httpRequestMethod: any, resource: any, roles: any) {
    this.user = user;
    this.roles = roles;
    this.httpRequestMethod = httpRequestMethod;
    this.resource = resource;
  }

  isAllowed() {
    return new Promise(async (resolve, reject) => {
      try {
        // if user has a provided role
        this.user.Roles.forEach((obj: any) => {
          if (this.roles.includes(obj.name)) {
            resolve(this.user);
          }
        });

        reject(new UnauthorisedError());
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }
}

export default Authorisation;
