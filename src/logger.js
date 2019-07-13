import * as winston from "winston";

const defaultFormat = winston.format.printf((info) => {
  return `${info.timestamp} [${info.level}]: ${info.message}`;
});

const createDevLogger = () => {
  return winston.createLogger({
    level: "silly",
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          defaultFormat,
        ),
      }),
    ],
  });
};

const createProdLogger = () => {
  return winston.createLogger({
    level: "info",
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          defaultFormat,
        ),
      }),
    ],
  });
};

const isRunningInProduction = () => {
  return process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === "PRODUCTION";
};

export {
  createDevLogger
}