const fs = require("node:fs/promises");
const express = require("express");
const multer = require("multer");
const { csvToSheetState, sheetStateToCsv } = require("./csv");
const {
  ensureStorageDirectory,
  validateSheetState,
  saveSheetState,
  loadSheetState,
} = require("./storage");

function createApp({ dataStoragePath }) {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.put("/api/sheets/:sheetId/state", async (req, res, next) => {
    try {
      const { sheetId } = req.params;
      const state = req.body;

      if (!validateSheetState(state)) {
        return res.status(400).json({ error: "Invalid sheet state payload" });
      }

      await saveSheetState(dataStoragePath, sheetId, state);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/sheets/:sheetId/state", async (req, res, next) => {
    try {
      const { sheetId } = req.params;
      const state = await loadSheetState(dataStoragePath, sheetId);
      return res.status(200).json(state);
    } catch (error) {
      if (error && error.code === "ENOENT") {
        return res.status(404).json({ error: "Sheet not found" });
      }
      return next(error);
    }
  });

  app.post("/api/sheets/:sheetId/import", upload.single("file"), async (req, res, next) => {
    try {
      const { sheetId } = req.params;
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "CSV file is required in field 'file'" });
      }

      const csvText = req.file.buffer.toString("utf8");
      const state = csvToSheetState(csvText);

      await saveSheetState(dataStoragePath, sheetId, state);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: "Failed to parse CSV" });
    }
  });

  app.get("/api/sheets/:sheetId/export", async (req, res, next) => {
    try {
      const { sheetId } = req.params;
      const state = await loadSheetState(dataStoragePath, sheetId);
      const csvText = sheetStateToCsv(state);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      return res.status(200).send(csvText);
    } catch (error) {
      if (error && error.code === "ENOENT") {
        return res.status(404).json({ error: "Sheet not found" });
      }
      return next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && "body" in error) {
      return res.status(400).json({ error: "Malformed JSON payload" });
    }

    return res.status(500).json({ error: "Internal server error" });
  });

  app.locals.initializeStorage = async () => {
    await ensureStorageDirectory(dataStoragePath);
    try {
      await fs.access(dataStoragePath);
    } catch {
      await fs.mkdir(dataStoragePath, { recursive: true });
    }
  };

  return app;
}

module.exports = {
  createApp,
};
