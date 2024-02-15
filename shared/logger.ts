import pino, { Logger } from "pino";
import expressPino from "express-pino-logger";

export const logger: Logger = pino({
  level: "info",
});

export const expressLogger = expressPino({
  logger,
});
