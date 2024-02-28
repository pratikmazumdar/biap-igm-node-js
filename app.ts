import express, { Application, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import issueRoutes from './routes/issue';
import issueStatusRoutes from './routes/issue_status';
import sseRoutes from './routes/sse';
import initializeFirebase from './lib/firebase/initializeFirebase';
import { Exception, sanitize } from './utils/Exception';
import { logger } from './shared/logger';

const createServer = (): Application => {
  const app: Application = express();

  initializeFirebase();

  app.use(express.json({ limit: '50mb' }));
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cors());

  app.use('/issueApis', issueRoutes);
  app.use('/issueApis', issueStatusRoutes);
  app.use('/issueApis', sseRoutes);

  app.use(express.static('images'));
  app.use('/issueApis/uploads', express.static('images'));

  app.get('/', async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
      success: true,
      message: 'The IGM service is running',
    });
  });

  app.get('/health', async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
      success: true,
      message: 'The server is running',
    });
  });

  app.use((err: Exception, _req: Request, res: Response, _next: NextFunction) => {
    err = sanitize(err);
    logger.error(err);
    return res.status(err.status).json({ status: err.status, error: { message: err.message } });
  });
  return app;

  return app;
};

export default createServer;
