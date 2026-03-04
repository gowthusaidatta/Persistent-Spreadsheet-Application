const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

async function ensureStorageDirectory(dataStoragePath) {
  await fs.mkdir(dataStoragePath, { recursive: true });
}

function buildSheetFilePath(dataStoragePath, sheetId) {
  return path.join(dataStoragePath, `${sheetId}.json`);
}

function validateSheetState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return false;
  }

  if (!state.cells || typeof state.cells !== "object" || Array.isArray(state.cells)) {
    return false;
  }

  for (const key of Object.keys(state.cells)) {
    if (!/^[A-Z]+\d+$/.test(key)) {
      return false;
    }
  }

  return true;
}

async function writeJsonAtomic(filePath, content) {
  const directory = path.dirname(filePath);
  const tempFileName = `.${path.basename(filePath)}.${process.pid}.${Date.now()}.${crypto.randomUUID()}.tmp`;
  const tempFilePath = path.join(directory, tempFileName);

  await fs.writeFile(tempFilePath, content, "utf8");
  await fs.rename(tempFilePath, filePath);
}

async function saveSheetState(dataStoragePath, sheetId, state) {
  const filePath = buildSheetFilePath(dataStoragePath, sheetId);
  const serialized = JSON.stringify(state, null, 2);
  await writeJsonAtomic(filePath, serialized);
}

async function loadSheetState(dataStoragePath, sheetId) {
  const filePath = buildSheetFilePath(dataStoragePath, sheetId);
  const fileContent = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContent);
}

module.exports = {
  ensureStorageDirectory,
  validateSheetState,
  saveSheetState,
  loadSheetState,
};
