import { logger } from "./shared/logger";
import createServer from "./app";
import dbConnect from "./database/mongooseConnector";
import "dotenv/config";
import { Application } from "express";

const port: number = Number(process.env.PORT) || 8989;

const app: Application = createServer();

(async () => {
  try {
    await dbConnect();
    app.listen(port, (): void => {
      logger.info(`Connected successfully on port ${port}`);
    });
  } catch (error: unknown) {
    logger.error(`Error occured: ${(error as Error).message}`);
  }
})();
