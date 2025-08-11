export const getEnvironment = () => {
  return {
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };
};
