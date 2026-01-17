import express from "express";
import { loadGraphAtStartup } from "./bootstrap/loadGraph";

export async function createApp(): Promise<any> {
  await loadGraphAtStartup();

  const app = express();
  app.use(express.json());

  return app;
}
