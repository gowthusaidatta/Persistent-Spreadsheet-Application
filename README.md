# Persistent Spreadsheet Application API

Backend service for a **persistent spreadsheet system** that stores sheet state using **atomic JSON file storage** and supports **CSV import/export with formula evaluation**.

The application is fully containerized with **Docker** and persists sheet data using **Docker volumes**, ensuring that data survives container restarts.

---

## Features

### Spreadsheet Persistence

* Save spreadsheet state to JSON files.
* Load spreadsheet state from disk.
* Atomic write operations prevent data corruption.

### CSV Import

* Upload CSV files to populate spreadsheet cells.
* Values beginning with `=` are stored as formulas.

### CSV Export

* Export spreadsheet state as CSV.
* Arithmetic formulas (`+ - * /`) are evaluated before export.

### Dockerized Deployment

* Application runs inside a Docker container.
* Persistent storage using Docker volume mapping.

### Health Monitoring

* `/health` endpoint for Docker health checks.

---

## Technology Stack

| Component         | Technology          |
| ----------------- | ------------------- |
| Backend Framework | Node.js + Express   |
| Data Storage      | JSON Files          |
| Containerization  | Docker              |
| Orchestration     | Docker Compose      |
| File Processing   | Node.js File System |

---

## Project Structure

```
.
├── src
│   ├── server.js
│   ├── app.js
│   ├── storage.js
│   ├── csv.js
│   ├── formula.js
│
├── tests
│   └── api.test.js
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── README.md
└── app_data
```

---

## Environment Variables

Defined in `.env.example`.

| Variable          | Description                                 |
| ----------------- | ------------------------------------------- |
| PORT              | Port on which the API runs                  |
| DATA_STORAGE_PATH | Directory where sheet JSON files are stored |

Example:

```
PORT=3000
DATA_STORAGE_PATH=/app/data
```

---

## Running the Application

### Run Without Docker

Install dependencies:

```
npm install
```

Copy environment variables:

```
cp .env.example .env
```

Start the server:

```
npm start
```

Server runs at:

```
http://localhost:3000
```

---

## Run Using Docker (Recommended)

Build and start container:

```
docker-compose up --build
```

Docker Compose mounts:

```
./app_data → /app/data
```

This ensures spreadsheet data persists even if containers restart.

---

## API Endpoints

### Health Check

```
GET /health
```

Response:

```
OK
```

---

## Save Spreadsheet State

```
PUT /api/sheets/:sheetId/state
```

Example request:

```
curl -X PUT http://localhost:3000/api/sheets/sheet1/state \
-H "Content-Type: application/json" \
-d '{"cells":{"A1":"Hello","B1":"World","C1":"=10*2"}}'
```

Response:

```
204 No Content
```

Data stored as:

```
/app/data/sheet1.json
```

Example JSON:

```
{
  "cells": {
    "A1": "Hello",
    "B1": "World",
    "C1": "=10*2"
  }
}
```

---

## Load Spreadsheet State

```
GET /api/sheets/:sheetId/state
```

Example:

```
curl http://localhost:3000/api/sheets/sheet1/state
```

Response:

```
{
 "cells":{
  "A1":"Hello",
  "B1":"World",
  "C1":"=10*2"
 }
}
```

---

## Import CSV

```
POST /api/sheets/:sheetId/import
```

Example CSV file:

```
Name,Value,Formula
ItemA,100,=5*10
ItemB,200,=20+5
```

Upload command:

```
curl -X POST http://localhost:3000/api/sheets/test/import \
-F "file=@sample.csv"
```

The CSV rows are mapped to spreadsheet cells.

Example mapping:

```
A1 Name
B1 Value
C1 Formula
```

Formulas are stored as strings.

---

## Export CSV

```
GET /api/sheets/:sheetId/export
```

Example:

```
curl http://localhost:3000/api/sheets/test/export
```

Response:

```
Name,Value,Formula
ItemA,100,50
ItemB,200,25
```

Formulas are evaluated before export.

Example:

```
=5*10 → 50
=20+5 → 25
```

---

## Atomic Write Strategy

To prevent file corruption during writes:

1. Data is written to a temporary file.
2. After successful write, the temp file is atomically renamed to the target file.

This guarantees that:

* The old file remains intact if the write fails.
* No partially written files occur.

---

## Data Persistence

Docker volume configuration:

```
volumes:
  - ./app_data:/app/data
```

Benefits:

* Sheet files survive container restarts.
* Data remains accessible on the host system.

Example stored files:

```
sheet1.json
csv-import-test.json
```

---

## Running Tests

```
npm test
```

Tests verify:

* API endpoint behavior
* JSON persistence
* CSV import/export
* Formula evaluation

---

## Example Workflow

1. Save spreadsheet state
2. Import CSV file
3. Load stored sheet
4. Export sheet to CSV
5. Restart container
6. Verify data still exists

---

## License

This project is intended for educational and evaluation purposes.
