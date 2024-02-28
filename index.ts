import { connect } from 'mongoose';
import 'dotenv/config';
import { Application } from 'express';

import { logger } from './shared/logger';
import createServer from './app';
import { getEnv } from './utils';

const port: number = Number(process.env.PORT) || 6969;

const app: Application = createServer();

(async () => {
  try {
    const dbString: string = getEnv('DB_CONNECTION_STRING');
    await connect(dbString);
    logger.info(`Connected successfully to mongodb: ${dbString}`);
    app.listen(port);
    logger.info(`Connected successfully on port ${port}`);
  } catch (error: unknown) {
    logger.error(`Error occured: ${(error as Error).message}`);
  }
})();
