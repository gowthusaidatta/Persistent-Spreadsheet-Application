const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");
const { toCellId, parseCellId } = require("./utils");
const { evaluateArithmeticFormula } = require("./formula");

function csvToSheetState(csvText) {
  const records = parse(csvText, {
    relax_column_count: true,
  });

  const cells = {};

  for (let rowIndex = 0; rowIndex < records.length; rowIndex += 1) {
    const row = records[rowIndex] || [];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      const rawValue = row[columnIndex];
      const value = rawValue == null ? "" : String(rawValue);
      const cellId = toCellId(rowIndex + 1, columnIndex + 1);
      cells[cellId] = value;
    }
  }

  return { cells };
}

function evaluateCellValueForExport(value) {
  if (typeof value === "string" && value.startsWith("=")) {
    const expression = value.slice(1);
    try {
      const result = evaluateArithmeticFormula(expression);
      return Number.isInteger(result) ? String(result) : String(result);
    } catch {
      return value;
    }
  }

  if (value == null) {
    return "";
  }

  return String(value);
}

function sheetStateToCsv(state) {
  const entries = Object.entries(state.cells || {});
  if (entries.length === 0) {
    return "";
  }

  let maxRow = 0;
  let maxColumn = 0;

  for (const [cellId] of entries) {
    const parsed = parseCellId(cellId);
    if (!parsed) {
      continue;
    }

    if (parsed.row > maxRow) {
      maxRow = parsed.row;
    }

    if (parsed.column > maxColumn) {
      maxColumn = parsed.column;
    }
  }

  if (maxRow === 0 || maxColumn === 0) {
    return "";
  }

  const matrix = Array.from({ length: maxRow }, () => Array.from({ length: maxColumn }, () => ""));

  for (const [cellId, value] of entries) {
    const parsed = parseCellId(cellId);
    if (!parsed) {
      continue;
    }

    matrix[parsed.row - 1][parsed.column - 1] = evaluateCellValueForExport(value);
  }

  return stringify(matrix);
}

module.exports = {
  csvToSheetState,
  sheetStateToCsv,
};
