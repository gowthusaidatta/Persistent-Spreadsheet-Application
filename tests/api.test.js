const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");

describe("Spreadsheet API", () => {
  let dataStoragePath;
  let app;

  beforeEach(async () => {
    dataStoragePath = await fs.mkdtemp(path.join(os.tmpdir(), "sheet-api-"));
    app = createApp({ dataStoragePath });
    await app.locals.initializeStorage();
  });

  afterEach(async () => {
    await fs.rm(dataStoragePath, { recursive: true, force: true });
  });

  test("saves and loads sheet state", async () => {
    const payload = {
      cells: {
        A1: "Hello",
        B1: "World",
        C1: "=10*2",
      },
    };

    await request(app).put("/api/sheets/sheet1/state").send(payload).expect(204);

    const response = await request(app).get("/api/sheets/sheet1/state").expect(200);
    expect(response.body).toEqual(payload);
  });

  test("returns 404 when sheet does not exist", async () => {
    await request(app).get("/api/sheets/missing/state").expect(404);
  });

  test("preserves original file when second save payload is invalid", async () => {
    const initialPayload = {
      cells: {
        A1: "initial",
      },
    };

    await request(app).put("/api/sheets/atomic-test/state").send(initialPayload).expect(204);

    await request(app)
      .put("/api/sheets/atomic-test/state")
      .send({ cells: "invalid" })
      .expect(400);

    const response = await request(app).get("/api/sheets/atomic-test/state").expect(200);
    expect(response.body).toEqual(initialPayload);
  });

  test("imports csv into sheet state", async () => {
    const csv = "Name,Value,Formula\nItem A,100,=A2+B2\nItem B,200,=5*10\n";

    await request(app)
      .post("/api/sheets/csv-import-test/import")
      .attach("file", Buffer.from(csv, "utf8"), "sample.csv")
      .expect(204);

    const response = await request(app).get("/api/sheets/csv-import-test/state").expect(200);
    expect(response.body.cells.A1).toBe("Name");
    expect(response.body.cells.C2).toBe("=A2+B2");
    expect(response.body.cells.C3).toBe("=5*10");
  });

  test("exports computed formula values as csv", async () => {
    const payload = {
      cells: {
        A1: "Result",
        B1: "=21*2",
        C1: "=100/4",
      },
    };

    await request(app).put("/api/sheets/csv-export-test/state").send(payload).expect(204);

    const response = await request(app).get("/api/sheets/csv-export-test/export").expect(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.text).toContain("Result,42,25");
    expect(response.text).not.toContain("=21*2");
  });
});
