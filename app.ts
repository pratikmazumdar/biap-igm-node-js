import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loadEnvVariables from "./utils/envHelper";
import issueRoutes from "./routes/issue";
import initializeFirebase from "./lib/firebase/initializeFirebase";

const createServer = (): express.Application => {
  const app: Application = express();

  // initialize environment variables
  loadEnvVariables();
  initializeFirebase();
  // Body parsing Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cors());

  //Routes
  app.use("/issueApis", issueRoutes);

  // eslint-disable-next-line no-unused-vars
  app.get("/", async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
      success: true,
      message: "The IGM service is running",
    });
  });

  // eslint-disable-next-line no-unused-vars
  app.get(
    "/health",
    async (_req: Request, res: Response): Promise<Response> => {
      return res.status(200).send({
        success: true,
        message: "The server is running",
      });
    }
  );

  return app;
};

export default createServer;
