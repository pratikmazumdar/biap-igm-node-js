import { UserDetails } from './issue';

declare module Express {
  export interface Request {
    user: UserDetails;
  }
}
