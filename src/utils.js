function toColumnLabel(columnNumber) {
  let value = columnNumber;
  let label = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
}

function toCellId(rowNumber, columnNumber) {
  return `${toColumnLabel(columnNumber)}${rowNumber}`;
}

function parseCellId(cellId) {
  const match = /^([A-Z]+)(\d+)$/.exec(cellId);
  if (!match) {
    return null;
  }

  const [, letters, rowPart] = match;
  let column = 0;

  for (const char of letters) {
    column = column * 26 + (char.charCodeAt(0) - 64);
  }

  return {
    row: Number.parseInt(rowPart, 10),
    column,
  };
}

module.exports = {
  toCellId,
  parseCellId,
};
