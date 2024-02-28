import { MongooseError } from 'mongoose';
import locals from '../shared/locals';
import { AxiosError } from 'axios';

export class Exception extends Error {
  status: number = 500;
  message: string = locals.error_internal_error;
  errors: Array<Exception | AxiosError> = [];
  constructor(status: number = 500, message: string = locals.error_internal_error) {
    super();
    this.status = status;
    this.message = message;
  }
}

export function sanitize(error: Exception) {
  switch (true) {
    case error instanceof MongooseError:
      return new Exception(400, locals.error_user_already_exists);
    case error instanceof AxiosError:
      if (error.errors) return new Exception(error.errors[1].status, error.errors[1].message);
      return new Exception(error.status, error.message);
    default:
      error.status = 500;
      return error;
  }
}
