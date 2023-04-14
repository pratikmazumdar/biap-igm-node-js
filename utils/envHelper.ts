import dotenv from "dotenv";
import path from "path";
import { logger } from "../shared/logger";

const loadEnvVariables = () => {
  if (process.env.NODE_ENV == "development") {
    logger.info("Development Environment !!!");
    dotenv.config({
      path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
    });
  }
};

export default loadEnvVariables;
