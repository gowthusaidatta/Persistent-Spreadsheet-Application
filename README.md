# Persistent Spreadsheet API

Backend service for spreadsheet persistence with atomic JSON storage and CSV import/export.

## Features

- `PUT /api/sheets/:sheetId/state` saves sheet state as JSON using atomic file writes.
- `GET /api/sheets/:sheetId/state` loads saved sheet state.
- `POST /api/sheets/:sheetId/import` imports CSV (`multipart/form-data`, field name: `file`) and overwrites state.
- `GET /api/sheets/:sheetId/export` exports sheet as CSV with formula evaluation for arithmetic formulas.
- `GET /health` health endpoint used by Docker healthcheck.

## Tech Stack

- Node.js + Express
- Filesystem persistence in `DATA_STORAGE_PATH`
- Docker + Docker Compose with bind-mounted volume (`./app_data`)

## Environment Variables

See `.env.example`.

- `PORT`: Port the API listens on.
- `DATA_STORAGE_PATH`: Absolute path inside container for sheet JSON files.

## Run Locally (without Docker)

```bash
npm install
cp .env.example .env
npm start
```

## Run with Docker Compose

```bash
docker-compose up --build
```

The compose setup mounts `./app_data` on host to `/app/data` in container so data survives restarts.

## API Examples

### Save State

```bash
curl -X PUT http://localhost:3000/api/sheets/sheet1/state \
  -H "Content-Type: application/json" \
  -d '{"cells":{"A1":"Hello","B1":"World","C1":"=10*2"}}' -i
```

Expected: `204 No Content`

### Load State

```bash
curl http://localhost:3000/api/sheets/sheet1/state
```

### Import CSV

```bash
curl -X POST http://localhost:3000/api/sheets/csv-import-test/import \
  -F "file=@./sample.csv" -i
```

### Export CSV

```bash
curl http://localhost:3000/api/sheets/csv-import-test/export
```

## Formula Handling

- Imported CSV values beginning with `=` are stored as formula strings.
- Export evaluates formulas only when they are simple arithmetic (`+`, `-`, `*`, `/`, parentheses, numbers).
- Formulas with unsupported tokens (for example cell references) are exported as-is.

## Architecture Overview

- `src/server.js`: entrypoint and runtime config
- `src/app.js`: route definitions and HTTP error handling
- `src/storage.js`: state validation, storage path handling, atomic JSON writes
- `src/csv.js`: CSV to/from sheet state conversion
- `src/formula.js`: safe arithmetic formula evaluation
- `tests/api.test.js`: API behavior tests

## Running Tests

```bash
npm test
```
