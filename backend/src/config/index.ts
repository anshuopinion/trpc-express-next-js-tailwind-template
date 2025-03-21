import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT as string;

interface IConfig {
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
  isTestEnvironment: boolean;
}

export const initConfig = (): IConfig => {
  const { NODE_ENV, PORT } = process.env;
  switch (NODE_ENV) {
    case "development":
      return {
        isProduction: false,
        isDevelopment: true,
        isTestEnvironment: false,
        port: Number(PORT) || 3001,
      };
    case "production":
      return {
        isProduction: true,
        isDevelopment: false,
        isTestEnvironment: false,
        port: Number(PORT) || 3001,
      };
    case "test":
      return {
        isProduction: false,
        isDevelopment: false,
        isTestEnvironment: true,
        port: Number(PORT) || 4000,
      };
    default:
      return {
        isProduction: false,
        isDevelopment: true,
        isTestEnvironment: false,
        port: Number(PORT) || 3001,
      };
  }
};
export const TEST_MODE = process.env.TEST_MODE as string;
export const DATABASE_URL = process.env.DATABASE_URL as string;

export const config = initConfig();
