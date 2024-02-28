import { UserDetails } from './issue';
import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
  user: UserDetails; // or any other type
}
