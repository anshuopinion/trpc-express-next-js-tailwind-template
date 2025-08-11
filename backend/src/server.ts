import dotenv from "dotenv";

dotenv.config();

import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { connectDB } from "./config";
import { appRouter } from "./routes";
import { createContext } from "./trpc";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3005",
      "http://localhost:3000",
      "http://localhost:3003",
      "http://localhost:3005",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// tRPC endpoint
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`🚀 tRPC Template Server`);
      console.log(`======================`);
      console.log(`🌐 Server: http://localhost:${port}`);
      console.log(`📡 tRPC API: http://localhost:${port}/trpc`);
      console.log(`🏥 Health: http://localhost:${port}/health`);
      console.log(`\n✅ Server is running and ready!`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
